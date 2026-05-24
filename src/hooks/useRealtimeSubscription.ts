import { useEffect } from 'react'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { useSentinelStore } from '@/lib/store'

export function useRealtimeSubscription() {
  const triggerSymptomReport = useSentinelStore((state) => state.triggerSymptomReport)
  const triggerSOSRequest = useSentinelStore((state) => state.triggerSOSRequest)
  const systemConnected = useSentinelStore((state) => state.systemConnected)
  const setSystemConnected = useSentinelStore((state) => state.setSystemConnected)

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setSystemConnected(true) // Stay connected in simulation mode
      return
    }

    setSystemConnected(true)

    // 1. Subscribe to symptom_reports INSERT events
    const reportsChannel = supabase
      .channel('symptom-reports-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'symptom_reports' },
        (payload) => {
          console.log('[Realtime DB Sync] New symptom report received:', payload.new)
          // Stream details to Zustand store which automatically updates analytics, maps, lists, and chimes
          const data = payload.new as any
          triggerSymptomReport({
            clinical_category: data.clinical_category,
            origin: data.origin,
            severity: data.severity as any,
            symptoms: data.symptoms || [],
            latitude: data.latitude,
            longitude: data.longitude,
            reporter_name: data.reporter_name,
            details: data.details || ''
          })
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('[Realtime DB Sync] Subscribed to symptom_reports table')
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          console.error('[Realtime DB Sync] Failed to connect to symptom_reports realtime channel')
        }
      })

    // 2. Subscribe to sos_requests INSERT events
    const sosChannel = supabase
      .channel('sos-requests-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'sos_requests' },
        (payload) => {
          console.log('[Realtime DB Sync] New SOS urgent request received:', payload.new)
          const data = payload.new as any
          triggerSOSRequest({
            citizen_name: data.citizen_name,
            citizen_id: data.citizen_id,
            status: data.status as any,
            village: data.village,
            latitude: data.latitude,
            longitude: data.longitude,
            heart_rate: data.heart_rate,
            temperature: data.temperature
          })
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('[Realtime DB Sync] Subscribed to sos_requests table')
        }
      })

    return () => {
      if (supabase) {
        supabase.removeChannel(reportsChannel)
        supabase.removeChannel(sosChannel)
      }
    }
  }, [triggerSymptomReport, triggerSOSRequest, setSystemConnected])
}
