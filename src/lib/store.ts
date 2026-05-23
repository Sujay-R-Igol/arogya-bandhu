import { create } from 'zustand'
import { playNotificationChime, startEmergencyAlarm, stopEmergencyAlarm, playWarningGong, playSuccessArpeggio } from './audio'

export interface SymptomReport {
  id: string
  timestamp: string
  clinical_category: string
  origin: string
  severity: 'LOW RISK' | 'MODERATE' | 'HIGH RISK'
  symptoms: string[]
  latitude: number
  longitude: number
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
  latitude: number
  longitude: number
  heart_rate: number
  temperature: number
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
  activeSOSAlert: SOSRequest | null // Holds current urgent popup SOS
  setActiveSOSAlert: (sos: SOSRequest | null) => void

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

// Initial seed data representing the exact metrics and signals shown in the UX mockups
const initialReports: SymptomReport[] = [
  {
    id: 'SENT-8821',
    timestamp: 'Nov 24, 08:14',
    clinical_category: 'Acute Respiratory',
    origin: 'Al-Zahra West',
    severity: 'HIGH RISK',
    symptoms: ['Fever', 'Dry Cough', 'Shortness of breath'],
    latitude: 32.4121,
    longitude: 35.1234,
    reporter_name: 'ASHA Worker Geeta',
    details: 'Abnormal cluster of acute respiratory signals detected. Three children in neighboring households presenting with high fever and wheezing.'
  },
  {
    id: 'SENT-8820',
    timestamp: 'Nov 24, 07:55',
    clinical_category: 'Dermal Rash',
    origin: 'North Ridge',
    severity: 'MODERATE',
    symptoms: ['Itching', 'Pustules', 'Mild Fever'],
    latitude: 32.4289,
    longitude: 35.1482,
    reporter_name: 'ASHA Worker Lakshmi',
    details: 'Unusual red blistering spots observed across school-age kids. Active surveillance initiated across Sector B primary school.'
  },
  {
    id: 'SENT-8819',
    timestamp: 'Nov 24, 07:32',
    clinical_category: 'Gastrointestinal',
    origin: 'Lower Delta',
    severity: 'LOW RISK',
    symptoms: ['Vomiting', 'Dehydration'],
    latitude: 32.3951,
    longitude: 35.1051,
    reporter_name: 'ASHA Worker Priya',
    details: 'Suspected water contamination from upstream agricultural runoff. Self-resolving symptoms, residents advised to boil drinking water.'
  },
  {
    id: 'SENT-8818',
    timestamp: 'Nov 24, 06:45',
    clinical_category: 'Persistent Fever',
    origin: 'Al-Zahra West',
    severity: 'HIGH RISK',
    symptoms: ['High Fever', 'Joint pain', 'Chills'],
    latitude: 32.4105,
    longitude: 35.1211,
    reporter_name: 'ASHA Worker Geeta',
    details: 'Adult male patient with high grade fever unresponsive to paracetamol for 4 days. Urgently referred to Primary Health Centre.'
  }
]

const initialSOS: SOSRequest[] = [
  {
    id: 'CI-9924',
    citizen_name: 'John Doe',
    citizen_id: 'CI-9924',
    status: 'PENDING',
    created_at: '4m ago',
    village: 'Silverstone Sector 4',
    latitude: 32.4188,
    longitude: 35.1322,
    heart_rate: 142,
    temperature: 37.2,
    eta: '04:12',
    urgent_logs: [
      '16:30:00 - Emergency trigger received from wearable device.',
      '16:30:15 - Vitals alert: Heart rate exceeds 140 BPM.',
      '16:31:00 - PHC Alert flagged. Waiting for dispatch approval.'
    ]
  },
  {
    id: 'CI-8761',
    citizen_name: 'Sarah Jenkins',
    citizen_id: 'CI-8761',
    status: 'RESPONDING',
    created_at: '12m ago',
    village: 'Grand Pine Estates',
    latitude: 32.4255,
    longitude: 35.1511,
    heart_rate: 102,
    temperature: 38.9,
    eta: '02:45',
    handler_id: 'Dispatch 03',
    urgent_logs: [
      '16:15:00 - SOS triggered by ASHA Worker Lakshmi.',
      '16:16:30 - Dispatch confirmed: Ambulance 02 en route.',
      '16:20:00 - ETA updated to 2 min 45 sec.'
    ]
  },
  {
    id: 'CI-5531',
    citizen_name: 'Michael Vance',
    citizen_id: 'CI-5531',
    status: 'RESOLVED',
    created_at: '13:55',
    village: 'Valley View North',
    latitude: 32.3855,
    longitude: 35.0912,
    heart_rate: 78,
    temperature: 36.6,
    handler_id: 'Admin 04',
    urgent_logs: [
      '13:20:00 - SOS triggered for dehydration/faintness.',
      '13:22:10 - Community health worker dispatched.',
      '13:55:00 - Incident resolved. Vitals stabilized. Case closed by Admin 04.'
    ]
  }
]

const initialAdvisories: Advisory[] = [
  {
    id: 'ADV-01',
    title: 'Boil Water Notice - Lower Delta Sector',
    content: 'Due to recent flash flooding and high turbidity in public wells, all residents in the Lower Delta Sector are advised to boil tap water for at least 1 minute before consumption or cooking.',
    category: 'CRITICAL',
    status: 'PUBLISHED',
    published_at: '8h ago',
    created_at: '8h ago'
  },
  {
    id: 'ADV-02',
    title: 'Influenza Season Surveillance',
    content: 'Ensure active surveillance protocols are displayed at all local schools. Ensure active respiratory case registers are updated daily by ASHA workers before the weekly census.',
    category: 'WARNING',
    status: 'PUBLISHED',
    published_at: '5h ago',
    created_at: '5h ago'
  },
  {
    id: 'ADV-03',
    title: 'Water Quality Routine Audit',
    content: 'Lake District public pipelines cleared after routine sanitation testing. Residual chlorine meets municipal guidelines.',
    category: 'ROUTINE',
    status: 'PUBLISHED',
    published_at: '8h ago',
    created_at: '8h ago'
  }
]

const initialNotifications: SystemNotification[] = [
  {
    id: 'NOT-1',
    title: 'New ASHA Report Received',
    message: 'Acute Respiratory cluster alert raised in Al-Zahra West.',
    timestamp: '8m ago',
    type: 'WARNING',
    read: false
  },
  {
    id: 'NOT-2',
    title: 'Critical Vitals Alert',
    message: 'Citizen John Doe heart rate is highly elevated (142 BPM).',
    timestamp: '4m ago',
    type: 'CRITICAL',
    read: false
  }
]

export const useSentinelStore = create<SentinelState>((set, get) => ({
  // Auth Store
  currentUser: {
    name: 'Dr. Elena Vance',
    title: 'Chief Health Officer',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200'
  },
  setCurrentUser: (user) => set({ currentUser: user }),
  isAuthenticated: true, // Bypass login locally by default for visual ease
  setIsAuthenticated: (val) => set({ isAuthenticated: val }),

  // Data Store
  symptomReports: initialReports,
  sosRequests: initialSOS,
  advisories: initialAdvisories,
  notifications: initialNotifications,

  // Realtime & Simulation Store
  systemConnected: true,
  setSystemConnected: (val) => set({ systemConnected: val }),
  soundEnabled: true,
  setSoundEnabled: (val) => {
    set({ soundEnabled: val })
    if (!val) stopEmergencyAlarm()
  },
  simulationActive: true,
  setSimulationActive: (val) => {
    set({ simulationActive: val })
    if (!val) stopEmergencyAlarm()
  },
  activeSOSAlert: null,
  setActiveSOSAlert: (sos) => set({ activeSOSAlert: sos }),

  // Filters Store
  filters: {
    symptom: '',
    village: '',
    timeRange: 'all'
  },
  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),
  setFilters: (newFilters) => set((state) => ({ filters: { ...state.filters, ...newFilters } })),
  clearFilters: () => set({ filters: { symptom: '', village: '', timeRange: 'all' } }),

  // Actions
  triggerSymptomReport: (report) => {
    const newReport: SymptomReport = {
      ...report,
      id: `SENT-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
    }

    set((state) => {
      const updatedReports = [newReport, ...state.symptomReports]
      const newNotification: SystemNotification = {
        id: `NOT-${Math.random()}`,
        title: 'New ASHA Report',
        message: `${report.clinical_category} reported from ${report.origin} by ${report.reporter_name}.`,
        timestamp: 'Just Now',
        type: report.severity === 'HIGH RISK' ? 'CRITICAL' : 'WARNING',
        read: false
      }
      
      // Play audio notification
      if (state.soundEnabled) {
        if (report.severity === 'HIGH RISK') {
          playWarningGong()
        } else {
          playNotificationChime()
        }
      }

      return {
        symptomReports: updatedReports,
        notifications: [newNotification, ...state.notifications]
      }
    })
  },

  triggerSOSRequest: (sos) => {
    const newSOS: SOSRequest = {
      ...sos,
      id: sos.citizen_id,
      created_at: 'Just Now',
      urgent_logs: [
        `${new Date().toLocaleTimeString()} - Emergency SOS triggered by citizen device.`,
        `${new Date().toLocaleTimeString()} - Broadcast pushed to local health channels.`,
        `${new Date().toLocaleTimeString()} - PHC Alert flagged. Waiting for dispatch.`
      ]
    }

    set((state) => {
      // Avoid duplicate SOS IDs
      if (state.sosRequests.some((s) => s.citizen_id === sos.citizen_id)) return {}

      const updatedSOS = [newSOS, ...state.sosRequests]
      const newNotification: SystemNotification = {
        id: `NOT-${Math.random()}`,
        title: 'CRITICAL SOS ALERT',
        message: `Emergency SOS triggered by ${sos.citizen_name} in ${sos.village}.`,
        timestamp: 'Just Now',
        type: 'CRITICAL',
        read: false
      }

      // Trigger popups & alarms
      if (state.soundEnabled) {
        startEmergencyAlarm()
      }

      return {
        sosRequests: updatedSOS,
        activeSOSAlert: newSOS, // Activates the urgent full-screen overlay modal
        notifications: [newNotification, ...state.notifications]
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
          alarmActive = true // Another pending SOS still exists
        }
        return sos
      })

      if (!alarmActive) {
        stopEmergencyAlarm()
      } else if (state.soundEnabled) {
        // Keep alarm beep but play success arpeggio on top to signify single resolution
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

      // Turn off sirens once ambulance is dispatched
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

  // Interactive Background Simulator
  tickSimulator: () => {
    if (!get().simulationActive) return

    const randVal = Math.random()

    // 1. Every tick has a 30% chance to simulate ASHA Worker reporting a case
    if (randVal < 0.35) {
      const categories = [
        { cat: 'Acute Respiratory', symps: ['High Fever', 'Dry Cough', 'Shortness of breath'], sev: 'HIGH RISK' as const },
        { cat: 'Dermal Rash', symps: ['Itching', 'Pustules', 'Blisters'], sev: 'MODERATE' as const },
        { cat: 'Gastrointestinal', symps: ['Diarrhea', 'Dehydration', 'Stomach Cramps'], sev: 'LOW RISK' as const },
        { cat: 'Persistent Fever', symps: ['Chills', 'Sweating', 'Joint Pain', 'Headache'], sev: 'HIGH RISK' as const }
      ]
      const villages = ['Al-Zahra West', 'North Ridge', 'Lower Delta', 'Valley View North', 'Grand Pine Estates']
      const reporters = ['ASHA Geeta', 'ASHA Lakshmi', 'ASHA Priya', 'ASHA Sunita', 'ASHA Rekha']

      const chosenCat = categories[Math.floor(Math.random() * categories.length)]
      const chosenVillage = villages[Math.floor(Math.random() * villages.length)]
      const chosenReporter = reporters[Math.floor(Math.random() * reporters.length)]

      // Coords centered around Al-Zahra West grid range
      const baseLat = 32.4120
      const baseLng = 35.1230
      const lat = baseLat + (Math.random() - 0.5) * 0.05
      const lng = baseLng + (Math.random() - 0.5) * 0.05

      get().triggerSymptomReport({
        clinical_category: chosenCat.cat,
        origin: chosenVillage,
        severity: chosenCat.sev,
        symptoms: chosenCat.symps,
        latitude: lat,
        longitude: lng,
        reporter_name: chosenReporter,
        details: `Simulated live data push from ${chosenReporter}. Observed active symptoms matching standard protocols.`
      })
    }
    // 2. 15% chance to simulate a high-priority Resident SOS Trigger!
    else if (randVal < 0.50) {
      const residents = [
        { name: 'Amit Sharma', id: 'CI-1102', village: 'Lower Delta' },
        { name: 'David Miller', id: 'CI-3498', village: 'North Ridge' },
        { name: 'Fatima Al-Sayed', id: 'CI-9987', village: 'Al-Zahra West' },
        { name: 'Kavita Roy', id: 'CI-4412', village: 'Grand Pine Estates' }
      ]
      
      const citizen = residents[Math.floor(Math.random() * residents.length)]
      
      // Coords centered around map origin
      const baseLat = 32.4120
      const baseLng = 35.1230
      const lat = baseLat + (Math.random() - 0.5) * 0.04
      const lng = baseLng + (Math.random() - 0.5) * 0.04

      get().triggerSOSRequest({
        citizen_name: citizen.name,
        citizen_id: citizen.id,
        status: 'PENDING',
        village: citizen.village,
        latitude: lat,
        longitude: lng,
        heart_rate: Math.floor(130 + Math.random() * 30), // High bpm
        temperature: Math.round((38.0 + Math.random() * 2) * 10) / 10 // High temp
      })
    }
  }
}))
