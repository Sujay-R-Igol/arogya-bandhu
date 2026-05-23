'use client'

import React, { useState } from 'react'
import dynamic from 'next/dynamic'
import { 
  Compass, 
  Layers, 
  MapPin, 
  Activity, 
  AlertCircle, 
  Flame, 
  Radio, 
  ShieldAlert,
  ArrowRight,
  TrendingUp
} from 'lucide-react'
import { useSentinelStore } from '@/lib/store'
import { playTone } from '@/lib/audio'

// Dynamic import with SSR disabled to prevent Leaflet window errors on next build
const LiveMap = dynamic(
  () => import('@/components/features/LiveMap'),
  { 
    ssr: false, 
    loading: () => (
      <div className="w-full h-full flex flex-col items-center justify-center bg-surfaceLight/25 border border-border rounded-xl text-xs text-muted gap-3">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <span>Initializing GIS spatial mapping layers...</span>
      </div>
    )
  }
)

export default function LiveMapPage() {
  const symptomReports = useSentinelStore((state) => state.symptomReports)
  const sosRequests = useSentinelStore((state) => state.sosRequests)

  // Local state controls
  const [mapFocus, setMapFocus] = useState<[number, number] | null>(null)
  const [layers, setLayers] = useState({
    reports: true,
    emergencies: true,
    severityHeat: true
  })

  // Calculate dynamic active points
  const activeSOS = sosRequests.filter(s => s.status !== 'RESOLVED' && s.latitude !== null && s.longitude !== null)
  const highRiskReports = symptomReports.filter(r => r.severity === 'HIGH RISK' && r.latitude !== null && r.longitude !== null)

  const flyToCoordinates = (lat: number, lng: number) => {
    playTone(600, 'sine', 0.1, 0.05)
    setMapFocus([lat, lng])
    // Clear focus shortly after to allow multiple clicks to trigger updates
    setTimeout(() => {
      setMapFocus(null)
    }, 500)
  }

  return (
    <div className="h-[calc(100vh-10.5rem)] flex flex-col lg:flex-row gap-5">
      
      {/* LEFT GIS MONITORING LAYERS SIDEBAR */}
      <aside className="w-full lg:w-80 shrink-0 flex flex-col gap-4">
        
        {/* Layer controllers card */}
        <div className="glass-card p-4 bg-surface/50 border border-border/80 rounded-xl space-y-4">
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-primary" />
              GIS Layer Registry
            </h3>
            <p className="text-[10px] text-muted">Asha/Citizen streaming pipelines</p>
          </div>

          <div className="space-y-2 text-xs font-semibold text-slate-300">
            {/* Toggle Reports Layer */}
            <label className="flex items-center justify-between p-2 rounded bg-surfaceLight/30 hover:bg-surfaceLight/50 cursor-pointer transition">
              <span className="flex items-center gap-2">
                <Radio className="w-3.5 h-3.5 text-primary" />
                Symptom Signals
              </span>
              <input 
                type="checkbox"
                checked={layers.reports}
                onChange={() => setLayers({ ...layers, reports: !layers.reports })}
                className="rounded accent-primary"
              />
            </label>

            {/* Toggle SOS Emergencies Layer */}
            <label className="flex items-center justify-between p-2 rounded bg-surfaceLight/30 hover:bg-surfaceLight/50 cursor-pointer transition">
              <span className="flex items-center gap-2">
                <ShieldAlert className="w-3.5 h-3.5 text-danger" />
                Active SOS Triggers
              </span>
              <input 
                type="checkbox"
                checked={layers.emergencies}
                onChange={() => setLayers({ ...layers, emergencies: !layers.emergencies })}
                className="rounded accent-danger"
              />
            </label>

            {/* Toggle Hazard Zones */}
            <label className="flex items-center justify-between p-2 rounded bg-surfaceLight/30 hover:bg-surfaceLight/50 cursor-pointer transition">
              <span className="flex items-center gap-2">
                <Flame className="w-3.5 h-3.5 text-warning" />
                Cluster Outbreak Zones
              </span>
              <input 
                type="checkbox"
                checked={layers.severityHeat}
                onChange={() => setLayers({ ...layers, severityHeat: !layers.severityHeat })}
                className="rounded accent-warning"
              />
            </label>
          </div>
        </div>

        {/* ACTIVE STREAMING HOTSPOTS LIST CARD */}
        <div className="glass-card p-4 bg-surface/50 border border-border/80 rounded-xl flex-1 flex flex-col overflow-hidden">
          <div className="mb-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-danger animate-pulse" />
              Active Signal Hotspots
            </h3>
            <p className="text-[10px] text-muted">Click origin coordinates to zoom</p>
          </div>

          {/* Scrolling items list */}
          <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 divide-y divide-border/30">
            
            {/* SOS Active Alerts */}
            {activeSOS.map((sos) => (
              <div 
                key={sos.id} 
                onClick={() => flyToCoordinates(sos.latitude, sos.longitude)}
                className="pt-2 flex justify-between items-start gap-2 cursor-pointer group hover:bg-surfaceLight/20 p-1.5 rounded transition"
              >
                <div className="truncate">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-danger animate-pulse shrink-0" />
                    <h4 className="text-xs font-bold text-white group-hover:text-danger transition truncate">{sos.citizen_name}</h4>
                  </div>
                  <p className="text-[10px] text-muted mt-0.5">{sos.village}</p>
                </div>
                <span className="text-[10px] font-bold text-slate-400 group-hover:text-primary flex items-center shrink-0">
                  SOS <ArrowRight className="w-3 h-3 ml-0.5 group-hover:translate-x-0.5 transition" />
                </span>
              </div>
            ))}

            {/* High Severity Symptoms */}
            {highRiskReports.map((rep) => (
              <div 
                key={rep.id} 
                onClick={() => flyToCoordinates(rep.latitude, rep.longitude)}
                className="pt-2 flex justify-between items-start gap-2 cursor-pointer group hover:bg-surfaceLight/20 p-1.5 rounded transition"
              >
                <div className="truncate">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-warning shrink-0" />
                    <h4 className="text-xs font-bold text-slate-200 group-hover:text-primary transition truncate">{rep.clinical_category}</h4>
                  </div>
                  <p className="text-[10px] text-muted mt-0.5">{rep.origin}</p>
                </div>
                <span className="text-[10px] font-bold text-slate-400 group-hover:text-primary flex items-center shrink-0">
                  {rep.id} <ArrowRight className="w-3 h-3 ml-0.5 group-hover:translate-x-0.5 transition" />
                </span>
              </div>
            ))}

            {activeSOS.length === 0 && highRiskReports.length === 0 && (
              <div className="p-8 text-center text-xs text-muted font-normal">
                No active epidemiological signals to inspect.
              </div>
            )}

          </div>
        </div>

      </aside>

      {/* RIGHT GIS SPATIAL VIEWPORT */}
      <section className="flex-1 min-h-[400px] lg:h-full glass-card overflow-hidden border border-border relative">
        <LiveMap focusedCoords={mapFocus} />
        
        {/* Floating map controls indicator */}
        <div className="absolute top-4 right-4 bg-background/90 border border-border p-2.5 rounded-lg backdrop-blur-md shadow-2xl flex items-center gap-2 text-[10px] tracking-wider font-semibold text-slate-300 z-[400] pointer-events-none uppercase">
          <span className="w-2.5 h-2.5 rounded-full bg-success animate-pulse shrink-0" />
          <span>GIS GPS Live Telemetry</span>
        </div>
      </section>

    </div>
  )
}
