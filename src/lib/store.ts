import { create } from 'zustand'
import { playNotificationChime, startEmergencyAlarm, stopEmergencyAlarm, playWarningGong, playSuccessArpeggio } from './audio'
import { supabaseClient } from './supabase/client'

export interface SymptomReport {
  id: string
  timestamp: string
  clinical_category: string
  origin: string
  severity: 'LOW RISK' | 'MODERATE' | 'HIGH RISK'
  symptoms: string[]
  latitude: number | null
  longitude: number | null
  reporter_name: string
  details: string
}

export interface SOSRequest {
  id: string
  citizen_name: string
  citizen_id: string
  status: 'PENDING' | 'RESPONDING' | 'RESOLVED'
  created_at: string
  village: string
  latitude: number | null
  longitude: number | null
  heart_rate: number | 'N/A'
  temperature: number | 'N/A'
  eta?: string
  handler_id?: string
  urgent_logs: string[]
}

export interface Advisory {
  id: string
  title: string
  content: string
  category: 'CRITICAL' | 'WARNING' | 'ROUTINE'
  status: 'DRAFT' | 'PUBLISHED'
  published_at?: string
  created_at: string
}

export interface SystemNotification {
  id: string
  title: string
  message: string
  timestamp: string
  type: 'INFO' | 'WARNING' | 'CRITICAL'
  read: boolean
}

interface SentinelState {
  // Authentication & Session
  currentUser: { name: string; title: string; image: string }
  setCurrentUser: (user: { name: string; title: string; image: string }) => void
  isAuthenticated: boolean
  setIsAuthenticated: (val: boolean) => void

  // Data arrays
  symptomReports: SymptomReport[]
  sosRequests: SOSRequest[]
  advisories: Advisory[]
  notifications: SystemNotification[]
  
  // Realtime & Simulation settings
  systemConnected: boolean
  setSystemConnected: (val: boolean) => void
  soundEnabled: boolean
  setSoundEnabled: (val: boolean) => void
  simulationActive: boolean
  setSimulationActive: (val: boolean) => void
  activeSOSAlert: SOSRequest | null
  setActiveSOSAlert: (sos: SOSRequest | null) => void

  // Realtime Data fetching
  isLoadingReports: boolean
  reportFetchError: string | null
  fetchInitialReports: () => Promise<void>
  subscribeToReports: () => void
  unsubscribeFromReports: () => void

  // Report database filters
  filters: {
    symptom: string
    village: string
    timeRange: string // '7d' | '30d' | 'all'
  }
  searchQuery: string
  setSearchQuery: (query: string) => void
  setFilters: (filters: Partial<SentinelState['filters']>) => void
  clearFilters: () => void

  // Actions
  triggerSymptomReport: (report: Omit<SymptomReport, 'id' | 'timestamp'>) => void
  triggerSOSRequest: (sos: Omit<SOSRequest, 'id' | 'created_at' | 'urgent_logs'>) => void
  resolveSOS: (id: string, handlerName: string) => void
  dispatchSOS: (id: string, eta: string) => void
  createAdvisory: (advisory: Omit<Advisory, 'id' | 'created_at'>) => void
  updateAdvisoryStatus: (id: string, status: 'DRAFT' | 'PUBLISHED') => void
  markNotificationsAsRead: () => void
  clearNotification: (id: string) => void

  // Simulation handlers
  tickSimulator: () => void
}

// Helper to parse location strings like "12.9716° N, 77.5946° E"
function parseLocation(locStr: string | null | undefined): { lat: number; lng: number } | null {
  if (!locStr) return null;
  const regex = /(-?\d+\.?\d*)[^\d-]*?(-?\d+\.?\d*)/;
  const match = locStr.match(regex);
  if (match && match[1] && match[2]) {
    let lat = parseFloat(match[1]);
    let lng = parseFloat(match[2]);
    if (locStr.toLowerCase().includes('s') && lat > 0) lat = -lat;
    if (locStr.toLowerCase().includes('w') && lng > 0) lng = -lng;
    if (!isNaN(lat) && !isNaN(lng)) return { lat, lng };
  }
  return null;
}

function mapSeverity(severity: string | null | undefined): 'LOW RISK' | 'MODERATE' | 'HIGH RISK' {
  if (!severity) return 'LOW RISK';
  const lower = severity.toLowerCase();
  if (lower.includes('severe') || lower.includes('emergency') || lower.includes('high')) return 'HIGH RISK';
  if (lower.includes('moderate')) return 'MODERATE';
  return 'LOW RISK';
}

function mapSupabaseToReport(row: any): SymptomReport {
  const coords = parseLocation(row.location);
  
  let symptomsArr: string[] = [];
  if (Array.isArray(row.symptoms)) {
    symptomsArr = row.symptoms;
  } else if (typeof row.symptoms === 'string') {
    try {
      symptomsArr = JSON.parse(row.symptoms);
    } catch {
      symptomsArr = [row.symptoms];
    }
  }

  return {
    id: row.id || `live-${Math.random()}`,
    timestamp: new Date(row.created_at || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ', ' + new Date(row.created_at || Date.now()).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
    clinical_category: row.disease || 'Unknown',
    origin: row.ward || 'Unknown',
    severity: mapSeverity(row.severity),
    symptoms: symptomsArr,
    latitude: coords ? coords.lat : null,
    longitude: coords ? coords.lng : null,
    reporter_name: row.username || row.reporter_type || 'Anonymous',
    details: `People affected: ${row.people_count || 1}. Status: ${row.status || 'REPORTED'}`
  }
}

// Keep initial empty arrays. Live data will populate this.
const initialReports: SymptomReport[] = []
const initialSOS: SOSRequest[] = []

let realtimeSubscription: any = null;

export const useSentinelStore = create<SentinelState>((set, get) => ({
  currentUser: {
    name: 'Dr. Elena Vance',
    title: 'Chief Health Officer',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200'
  },
  setCurrentUser: (user) => set({ currentUser: user }),
  isAuthenticated: true, 
  setIsAuthenticated: (val) => set({ isAuthenticated: val }),

  symptomReports: initialReports,
  sosRequests: initialSOS,
  advisories: [],
  notifications: [],

  systemConnected: true,
  setSystemConnected: (val) => set({ systemConnected: val }),
  soundEnabled: true,
  setSoundEnabled: (val) => {
    set({ soundEnabled: val })
    if (!val) stopEmergencyAlarm()
  },
  simulationActive: false, // Disabled by default for production mode
  setSimulationActive: (val) => {
    set({ simulationActive: val })
    if (!val) stopEmergencyAlarm()
  },
  activeSOSAlert: null,
  setActiveSOSAlert: (sos) => set({ activeSOSAlert: sos }),

  // Realtime Data Fetching
  isLoadingReports: false,
  reportFetchError: null,

  fetchInitialReports: async () => {
    set({ isLoadingReports: true, reportFetchError: null });
    try {
      const { data, error } = await supabaseClient
        .from('health_reports')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;

      if (data) {
        const reports = data.map(mapSupabaseToReport);
        
        // Derive SOS from HIGH RISK reports
        const derivedSOS = reports
          .filter(r => r.severity === 'HIGH RISK')
          .map(r => ({
            id: `SOS-${r.id}`,
            citizen_name: r.reporter_name,
            citizen_id: r.id,
            status: 'PENDING' as const,
            created_at: r.timestamp,
            village: r.origin,
            latitude: r.latitude,
            longitude: r.longitude,
            heart_rate: 'N/A' as const,
            temperature: 'N/A' as const,
            urgent_logs: [
              `${r.timestamp} - Derived SOS from HIGH RISK health report.`,
              `${r.timestamp} - Details: ${r.details}`
            ]
          }));

        set({ 
          symptomReports: reports, 
          sosRequests: derivedSOS,
          isLoadingReports: false 
        });
      }
    } catch (error: any) {
      console.error("Failed to fetch reports:", error);
      set({ reportFetchError: error.message, isLoadingReports: false });
    }
  },

  subscribeToReports: () => {
    if (realtimeSubscription) return; // Already subscribed

    realtimeSubscription = supabaseClient
      .channel('public:health_reports')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'health_reports' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newReport = mapSupabaseToReport(payload.new);
            
            set((state) => {
              const updatedReports = [newReport, ...state.symptomReports];
              
              const newNotification: SystemNotification = {
                id: `NOT-${Math.random()}`,
                title: 'New Health Report',
                message: `${newReport.clinical_category} reported from ${newReport.origin}.`,
                timestamp: 'Just Now',
                type: newReport.severity === 'HIGH RISK' ? 'CRITICAL' : 'WARNING',
                read: false
              };

              let derivedSOS = null;
              if (newReport.severity === 'HIGH RISK') {
                derivedSOS = {
                  id: `SOS-${newReport.id}`,
                  citizen_name: newReport.reporter_name,
                  citizen_id: newReport.id,
                  status: 'PENDING' as const,
                  created_at: newReport.timestamp,
                  village: newReport.origin,
                  latitude: newReport.latitude,
                  longitude: newReport.longitude,
                  heart_rate: 'N/A' as const,
                  temperature: 'N/A' as const,
                  urgent_logs: [
                    `${newReport.timestamp} - Derived SOS from HIGH RISK health report.`,
                    `${newReport.timestamp} - Details: ${newReport.details}`
                  ]
                };

                if (state.soundEnabled) {
                  startEmergencyAlarm();
                }
              } else if (state.soundEnabled) {
                if (newReport.severity === 'MODERATE') {
                  playWarningGong();
                } else {
                  playNotificationChime();
                }
              }

              // Simple Hotspot Detection
              // Check if there are >= 3 HIGH RISK/MODERATE reports in the same ward within the current state
              const recentWardReports = updatedReports.filter(r => 
                r.origin === newReport.origin && 
                (r.severity === 'HIGH RISK' || r.severity === 'MODERATE')
              );

              let newAdvisory = null;
              if (recentWardReports.length >= 3) {
                // To avoid spam, check if we already have an active advisory for this ward
                const exists = state.advisories.some(a => a.title.includes(newReport.origin) && a.status === 'PUBLISHED');
                if (!exists) {
                  newAdvisory = {
                    id: `ADV-${Math.floor(100 + Math.random() * 900)}`,
                    title: `Outbreak Warning - ${newReport.origin}`,
                    content: `Automated detection: ${recentWardReports.length} severe/moderate reports clustered in ${newReport.origin}. Immediate surveillance recommended.`,
                    category: 'CRITICAL' as const,
                    status: 'PUBLISHED' as const,
                    published_at: 'Just Now',
                    created_at: 'Just Now'
                  };
                }
              }

              return {
                symptomReports: updatedReports,
                notifications: [newNotification, ...state.notifications],
                ...(derivedSOS && { 
                  sosRequests: [derivedSOS, ...state.sosRequests],
                  activeSOSAlert: derivedSOS
                }),
                ...(newAdvisory && {
                  advisories: [newAdvisory, ...state.advisories]
                })
              };
            });
          }
        }
      )
      .subscribe();
      
      set({ systemConnected: true });
  },

  unsubscribeFromReports: () => {
    if (realtimeSubscription) {
      supabaseClient.removeChannel(realtimeSubscription);
      realtimeSubscription = null;
      set({ systemConnected: false });
    }
  },

  filters: {
    symptom: '',
    village: '',
    timeRange: 'all'
  },
  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),
  setFilters: (newFilters) => set((state) => ({ filters: { ...state.filters, ...newFilters } })),
  clearFilters: () => set({ filters: { symptom: '', village: '', timeRange: 'all' } }),

  triggerSymptomReport: (report) => {
    // Left for manual triggers / UI overrides
    const newReport: SymptomReport = {
      ...report,
      id: `SENT-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
    }
    set((state) => {
      const updatedReports = [newReport, ...state.symptomReports]
      return { symptomReports: updatedReports }
    })
  },

  triggerSOSRequest: (sos) => {
    const newSOS: SOSRequest = {
      ...sos,
      id: sos.citizen_id,
      created_at: 'Just Now',
      urgent_logs: [
        `${new Date().toLocaleTimeString()} - Emergency SOS triggered by citizen device.`
      ]
    }
    set((state) => {
      if (state.sosRequests.some((s) => s.citizen_id === sos.citizen_id)) return {}
      return {
        sosRequests: [newSOS, ...state.sosRequests],
        activeSOSAlert: newSOS,
      }
    })
  },

  resolveSOS: (id, handlerName) => {
    set((state) => {
      let alarmActive = false
      const updatedSOS = state.sosRequests.map((sos) => {
        if (sos.id === id) {
          const timestamp = new Date().toLocaleTimeString()
          return {
            ...sos,
            status: 'RESOLVED' as const,
            handler_id: handlerName,
            urgent_logs: [
              ...sos.urgent_logs,
              `${timestamp} - SOS emergency officially resolved by Chief Health Officer.`,
              `${timestamp} - Case closed.`
            ]
          }
        }
        if (sos.status === 'PENDING') {
          alarmActive = true
        }
        return sos
      })

      if (!alarmActive) {
        stopEmergencyAlarm()
      } else if (state.soundEnabled) {
        playSuccessArpeggio()
      }

      return {
        sosRequests: updatedSOS,
        activeSOSAlert: state.activeSOSAlert?.id === id ? null : state.activeSOSAlert
      }
    })
  },

  dispatchSOS: (id, eta) => {
    set((state) => {
      const updatedSOS = state.sosRequests.map((sos) => {
        if (sos.id === id) {
          const timestamp = new Date().toLocaleTimeString()
          return {
            ...sos,
            status: 'RESPONDING' as const,
            eta,
            handler_id: 'CHO Dispatch Center',
            urgent_logs: [
              ...sos.urgent_logs,
              `${timestamp} - Ambulance dispatched. Est. Arrival: ${eta} minutes.`,
              `${timestamp} - Dispatch tracking initiated.`
            ]
          }
        }
        return sos
      })

      let alarmActive = false
      updatedSOS.forEach((s) => {
        if (s.status === 'PENDING') alarmActive = true
      })
      if (!alarmActive) {
        stopEmergencyAlarm()
      } else {
        playSuccessArpeggio()
      }

      return {
        sosRequests: updatedSOS,
        activeSOSAlert: state.activeSOSAlert?.id === id ? null : state.activeSOSAlert
      }
    })
  },

  createAdvisory: (advisory) => {
    const newAdv: Advisory = {
      ...advisory,
      id: `ADV-${Math.floor(10 + Math.random() * 90)}`,
      created_at: 'Just Now',
      published_at: advisory.status === 'PUBLISHED' ? 'Just Now' : undefined
    }

    set((state) => ({
      advisories: [newAdv, ...state.advisories]
    }))

    if (get().soundEnabled) {
      playNotificationChime()
    }
  },

  updateAdvisoryStatus: (id, status) => {
    set((state) => ({
      advisories: state.advisories.map((a) => {
        if (a.id === id) {
          return {
            ...a,
            status,
            published_at: status === 'PUBLISHED' ? 'Just Now' : undefined
          }
        }
        return a
      })
    }))
  },

  markNotificationsAsRead: () => {
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true }))
    }))
  },

  clearNotification: (id) => {
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id)
    }))
  },

  // Interactive Background Simulator - Disabled by default
  tickSimulator: () => {
    if (!get().simulationActive) return
    // Simple mock ping for testing feature flag
    console.log("Simulator tick - simulationActive is true");
  }
}))
