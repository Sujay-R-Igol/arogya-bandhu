import { create } from 'zustand'
import { playNotificationChime, startEmergencyAlarm, stopEmergencyAlarm, playWarningGong, playSuccessArpeggio } from './audio'
import { supabaseClient } from './supabase/client'

export const BHOGADI_ZONES = [
  { id: 'Bhogadi', label: 'Bhogadi (All)', lat: 12.3025, lng: 76.6025 },
  { id: 'Bogadi 2nd Stage', label: 'Bogadi 2nd Stage', lat: 12.3080, lng: 76.6150 },
  { id: 'Hunsur Road', label: 'Hunsur Road', lat: 12.3210, lng: 76.6200 },
  { id: 'Vijayanagar', label: 'Vijayanagar', lat: 12.3250, lng: 76.6280 },
  { id: 'Hebbal', label: 'Hebbal', lat: 12.3480, lng: 76.6180 },
  { id: 'Yelwala', label: 'Yelwala', lat: 12.3550, lng: 76.5920 },
  { id: 'Mysuru Rural', label: 'Mysuru Rural', lat: 12.3100, lng: 76.5850 }
];

export function getZoneAnchor(wardId: string) {
  const zone = BHOGADI_ZONES.find(z => z.id === wardId);
  if (zone) return { lat: zone.lat, lng: zone.lng };
  return { lat: 12.3345, lng: 76.6190 };
}

export interface HotspotAnalytics {
  zoneId: string;
  name: string;
  lat: number;
  lng: number;
  reportCount: number;
  dominantSymptom: string;
  severityLevel: 'LOW' | 'MODERATE' | 'ELEVATED' | 'OUTBREAK';
}

export function computeHotspots(reports: SymptomReport[]): HotspotAnalytics[] {
  return BHOGADI_ZONES.map(zone => {
    const zoneReports = reports.filter(r => r.origin === zone.id);
    const count = zoneReports.length;
    
    // Calculate severity
    const highRiskCount = zoneReports.filter(r => r.severity === 'HIGH RISK').length;
    let severityLevel: HotspotAnalytics['severityLevel'] = 'LOW';
    if (count > 0) severityLevel = 'MODERATE';
    if (count >= 3 || highRiskCount >= 1) severityLevel = 'ELEVATED';
    if (count >= 8 || highRiskCount >= 3) severityLevel = 'OUTBREAK';

    // Calculate dominant symptom
    const symptomCounts: Record<string, number> = {};
    zoneReports.forEach(r => {
      r.symptoms.forEach(s => {
        symptomCounts[s] = (symptomCounts[s] || 0) + 1;
      });
    });
    let dominantSymptom = 'N/A';
    let max = 0;
    for (const [sym, c] of Object.entries(symptomCounts)) {
      if (c > max) { max = c; dominantSymptom = sym; }
    }

    return {
      zoneId: zone.id,
      name: zone.label,
      lat: zone.lat,
      lng: zone.lng,
      reportCount: count,
      dominantSymptom,
      severityLevel
    };
  }).filter(h => h.reportCount > 0);
}

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
  contact_number: string
  details: string
  status: string
}

export interface SOSRequest {
  id: string
  citizen_name: string
  citizen_id: string
  status: 'PENDING' | 'RESPONDING' | 'UNDER_OBSERVATION' | 'RESOLVED'
  created_at: string
  village: string
  latitude: number | null
  longitude: number | null
  disease: string
  severity: string
  contact_number: string
  eta?: string
  handler_id?: string
  urgent_logs: string[]
}

export interface Advisory {
  id: string
  title: string
  message: string
  category: string
  affected_area: string
  media_type: 'none' | 'audio' | 'video'
  media_url?: string
  threat_level: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW'
  issued_by: string
  status: 'DRAFT' | 'ACTIVE'
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
  currentUser: { name: string; title: string; image: string; role?: string; email?: string } | null
  setCurrentUser: (user: { name: string; title: string; image: string; role?: string; email?: string } | null) => void
  isAuthenticated: boolean
  setIsAuthenticated: (val: boolean) => void
  isAuthenticating: boolean
  setIsAuthenticating: (val: boolean) => void

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
  
  // Realtime Advisories fetching
  isLoadingAdvisories: boolean
  advisoryFetchError: string | null
  fetchAdvisories: () => Promise<void>
  subscribeToAdvisories: () => void
  unsubscribeFromAdvisories: () => void

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
  updateSOSStatus: (id: string, status: 'PENDING' | 'RESPONDING' | 'UNDER_OBSERVATION' | 'RESOLVED', logMessage: string) => Promise<void>
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

  const originWard = row.ward || 'Unknown';
  const fallbackAnchor = getZoneAnchor(originWard);

  return {
    id: row.id || `live-${Math.random()}`,
    timestamp: new Date(row.created_at || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ', ' + new Date(row.created_at || Date.now()).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
    clinical_category: row.disease || 'Unknown',
    origin: originWard,
    severity: mapSeverity(row.severity),
    symptoms: symptomsArr,
    latitude: coords && coords.lat ? coords.lat : fallbackAnchor.lat,
    longitude: coords && coords.lng ? coords.lng : fallbackAnchor.lng,
    reporter_name: row.username || row.reporter_type || 'Anonymous',
    contact_number: row.contact_number || 'Not Provided',
    details: `People affected: ${row.people_count || 1}.`,
    status: (row.status || 'PENDING').toUpperCase()
  }
}

// Keep initial empty arrays. Live data will populate this.
const initialReports: SymptomReport[] = []
const initialSOS: SOSRequest[] = []

let realtimeSubscription: any = null;
let advisoriesSubscription: any = null;

export const useSentinelStore = create<SentinelState>((set, get) => ({
  currentUser: null,
  setCurrentUser: (user) => set({ currentUser: user }),
  isAuthenticated: false, 
  setIsAuthenticated: (val) => set({ isAuthenticated: val }),
  isAuthenticating: true,
  setIsAuthenticating: (val) => set({ isAuthenticating: val }),

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
  isLoadingAdvisories: false,
  advisoryFetchError: null,

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
            status: (r.status as any)?.toUpperCase() || 'PENDING',
            created_at: r.timestamp,
            village: r.origin,
            latitude: r.latitude,
            longitude: r.longitude,
            disease: r.clinical_category,
            severity: r.severity,
            contact_number: r.contact_number,
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
                // To avoid spam, check if we already have a draft/active advisory for this ward
                const exists = state.advisories.some(a => a.title.includes(newReport.origin) && (a.status === 'ACTIVE' || a.status === 'DRAFT'));
                if (!exists) {
                  // We insert directly to Supabase so all clients see it
                  const advToInsert = {
                    title: `Outbreak Warning - ${newReport.origin}`,
                    message: `Automated detection: ${recentWardReports.length} severe/moderate reports clustered in ${newReport.origin}. Immediate surveillance recommended.`,
                    category: 'OUTBREAK',
                    affected_area: newReport.origin,
                    media_type: 'none',
                    threat_level: 'HIGH',
                    issued_by: 'Sentinel System',
                    status: 'DRAFT'
                  };
                  
                  // Fire-and-forget insert
                  supabaseClient.from('advisories').insert(advToInsert).then(({ error }) => {
                    if (error) console.error("Failed to auto-create advisory:", error);
                  });
                }
              }

              return {
                symptomReports: updatedReports,
                notifications: [newNotification, ...state.notifications],
                ...(derivedSOS && { 
                  sosRequests: [derivedSOS, ...state.sosRequests],
                  activeSOSAlert: derivedSOS
                })
              };
            });
          } else if (payload.eventType === 'UPDATE') {
            const updatedReport = mapSupabaseToReport(payload.new);
            set((state) => {
              const updatedReports = state.symptomReports.map(r => 
                r.id === updatedReport.id ? updatedReport : r
              );
              
              const updatedSOS = state.sosRequests.map(sos => {
                if (sos.citizen_id === updatedReport.id) {
                  return {
                    ...sos,
                    status: updatedReport.status as any
                  };
                }
                return sos;
              });

              return {
                symptomReports: updatedReports,
                sosRequests: updatedSOS
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

  fetchAdvisories: async () => {
    set({ isLoadingAdvisories: true, advisoryFetchError: null });
    try {
      const { data, error } = await supabaseClient
        .from('advisories')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        set({ advisories: data, isLoadingAdvisories: false });
      }
    } catch (error: any) {
      console.error("Failed to fetch advisories:", error);
      set({ advisoryFetchError: error.message, isLoadingAdvisories: false });
    }
  },

  subscribeToAdvisories: () => {
    if (advisoriesSubscription) return;

    advisoriesSubscription = supabaseClient
      .channel('public:advisories')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'advisories' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            set((state) => ({
              advisories: [payload.new as Advisory, ...state.advisories]
            }));
          } else if (payload.eventType === 'UPDATE') {
            set((state) => ({
              advisories: state.advisories.map(a => a.id === payload.new.id ? (payload.new as Advisory) : a)
            }));
          }
        }
      )
      .subscribe();
  },

  unsubscribeFromAdvisories: () => {
    if (advisoriesSubscription) {
      supabaseClient.removeChannel(advisoriesSubscription);
      advisoriesSubscription = null;
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

  updateSOSStatus: async (id, status, logMessage) => {
    // 1. Persist to Supabase
    // Extract the raw health_reports UUID from the SOS- prefixed ID
    const dbId = id.replace('SOS-', '');
    
    console.log('[DEBUG] updateSOSStatus Initiated');
    console.log('[DEBUG] Original ID:', id);
    console.log('[DEBUG] Parsed dbId:', dbId);
    console.log('[DEBUG] Payload status:', status);

    try {
      const response = await supabaseClient
        .from('health_reports')
        .update({ status: status.toLowerCase() })
        .eq('id', dbId)
        .select();
      
      console.log('[DEBUG] Supabase Response:', response);

      if (response.error) {
        console.error('[DEBUG] Supabase Error updating SOS status:', response.error);
      } else {
        console.log('[DEBUG] Supabase Update Success, affected rows:', response.data?.length);
      }
    } catch (e) {
      console.error('[DEBUG] Exception in updateSOSStatus:', e);
    }

    // 2. Update local state
    set((state) => {
      let alarmActive = false;
      const updatedSOS = state.sosRequests.map((sos) => {
        if (sos.id === id) {
          const timestamp = new Date().toLocaleTimeString();
          return {
            ...sos,
            status,
            urgent_logs: [
              ...sos.urgent_logs,
              `${timestamp} - ${logMessage}`
            ]
          };
        }
        if (sos.status === 'PENDING') {
          alarmActive = true;
        }
        return sos;
      });

      if (!alarmActive) {
        stopEmergencyAlarm();
      } else if (status === 'RESOLVED' && state.soundEnabled) {
        playSuccessArpeggio();
      }

      return {
        sosRequests: updatedSOS,
        activeSOSAlert: state.activeSOSAlert?.id === id && status === 'RESOLVED' ? null : state.activeSOSAlert
      };
    });
  },

  createAdvisory: (advisory) => {
    // In a real implementation this would push to Supabase via an API or client.insert
    // We are using a mock implementation here since CHO dashboard will have its own API
    const newAdv: Advisory = {
      ...advisory,
      id: `ADV-${Math.floor(10 + Math.random() * 90)}`,
      created_at: new Date().toISOString()
    } as Advisory;

    set((state) => ({
      advisories: [newAdv, ...state.advisories]
    }))

    if (get().soundEnabled) {
      playNotificationChime()
    }
  },

  updateAdvisoryStatus: (id, status) => {
    // This is mocked for local state, actual update should hit Supabase
    set((state) => ({
      advisories: state.advisories.map((a) => {
        if (a.id === id) {
          return {
            ...a,
            status: status as 'DRAFT' | 'ACTIVE'
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
