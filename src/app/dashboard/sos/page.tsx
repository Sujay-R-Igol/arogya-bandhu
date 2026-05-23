'use client'

import React, { useState } from 'react'
import { 
  AlertTriangle, 
  Clock, 
  MapPin, 
  Heart, 
  Thermometer, 
  Check, 
  UserCheck, 
  Search, 
  SlidersHorizontal,
  X,
  FileText,
  Activity,
  History
} from 'lucide-react'
import { useSentinelStore } from '@/lib/store'
import { playTone, playSuccessArpeggio, playWarningGong } from '@/lib/audio'

export default function SOSQueue() {
  const sosRequests = useSentinelStore((state) => state.sosRequests)
  const dispatchSOS = useSentinelStore((state) => state.dispatchSOS)
  const resolveSOS = useSentinelStore((state) => state.resolveSOS)
  const currentUser = useSentinelStore((state) => state.currentUser)

  // Local state controls
  const [selectedSosId, setSelectedSosId] = useState<string>('CI-9924') // Default to John Doe CI-9924
  const [searchQuery, setSearchQuery] = useState('')
  const [etaValue, setEtaValue] = useState('04:12')

  // Find currently active dossier object
  const activeDossier = sosRequests.find((s) => s.id === selectedSosId) || sosRequests[0]

  // Filter queue items matching query
  const filteredQueue = sosRequests.filter((sos) => {
    const text = searchQuery.toLowerCase().trim()
    return (
      !text ||
      sos.citizen_name.toLowerCase().includes(text) ||
      sos.citizen_id.toLowerCase().includes(text) ||
      sos.village.toLowerCase().includes(text)
    )
  })

  const handleDispatchAction = (id: string) => {
    dispatchSOS(id, etaValue)
  }

  const handleResolveAction = (id: string) => {
    resolveSOS(id, currentUser.name)
  }

  return (
    <div className="h-[calc(100vh-10.5rem)] flex flex-col lg:flex-row gap-6">
      
      {/* ==========================================
          LEFT COLUMN: EMERGENCY INCIDENTS LIST
          ========================================== */}
      <section className="flex-1 flex flex-col gap-4 overflow-hidden h-full">
        
        {/* Incident List Header */}
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight font-sans">
            Response Queue
          </h1>
          <p className="text-xs text-muted mt-0.5">
            Real-time emergency triage monitoring and clinical dispatch commands.
          </p>
        </div>

        {/* Search & filters inside Response Queue */}
        <div className="flex gap-2.5">
          <div className="relative flex-1">
            <Search className="absolute left-3 inset-y-0 my-auto w-4 h-4 text-muted" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search residents or citizen IDs..." 
              className="w-full pl-9 pr-4 py-2 bg-surface/50 border border-border rounded-lg text-xs placeholder-slate-500 text-white focus:outline-none"
            />
          </div>
          <button className="p-2 bg-surface border border-border rounded-lg text-muted hover:text-white" title="Advanced Triage Filters">
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Incidents cards queue list */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {filteredQueue.length === 0 ? (
            <div className="p-12 text-center text-xs text-muted border border-dashed border-border/80 rounded-xl">
              No emergency incidents in queue.
            </div>
          ) : (
            filteredQueue.map((sos) => {
              const isSelected = sos.id === selectedSosId
              
              return (
                <div 
                  key={sos.id}
                  onClick={() => {
                    playTone(600, 'sine', 0.08, 0.04)
                    setSelectedSosId(sos.id)
                  }}
                  className={`p-4 rounded-xl border cursor-pointer relative transition duration-300 ${
                    isSelected 
                      ? 'bg-surface border-primary shadow-[0_4px_25px_rgba(0,240,255,0.06)]' 
                      : 'bg-surface/40 border-border/70 hover:border-border'
                  } ${
                    sos.status === 'PENDING' && !isSelected 
                      ? 'animate-border-glow bg-danger/5 border-danger/30' 
                      : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    
                    {/* Circle icon type */}
                    <div className="flex gap-3.5">
                      <div className={`p-2.5 rounded-lg border flex items-center justify-center shrink-0 mt-0.5 ${
                        sos.status === 'PENDING' ? 'bg-danger/10 border-danger/25 text-danger' :
                        sos.status === 'RESPONDING' ? 'bg-warning/10 border-warning/25 text-warning' :
                        'bg-success/15 border-success/25 text-success'
                      }`}>
                        <AlertTriangle className="w-4.5 h-4.5" />
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-xs font-bold text-white tracking-wide">{sos.citizen_name}</h3>
                          
                          <span className={`px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase ${
                            sos.status === 'PENDING' ? 'bg-danger text-white animate-pulse' :
                            sos.status === 'RESPONDING' ? 'bg-warning text-background' :
                            'bg-slate-700 text-slate-300'
                          }`}>
                            {sos.status}
                          </span>

                          <span className="text-[10px] text-primary/70 font-bold tracking-widest uppercase">
                            {sos.citizen_id}
                          </span>
                        </div>

                        <p className="text-[11px] text-slate-300 mt-1 flex items-center gap-1 font-semibold">
                          <MapPin className="w-3.5 h-3.5 text-muted shrink-0" />
                          <span>{sos.village}</span>
                        </p>
                      </div>
                    </div>

                    {/* Wait timer / Details status */}
                    <div className="text-right text-[10px] text-muted tracking-wider uppercase font-semibold">
                      {sos.status === 'PENDING' && (
                        <span className="text-danger flex items-center gap-1">
                          <Clock className="w-3 h-3 text-danger shrink-0" /> Wait: {sos.created_at}
                        </span>
                      )}
                      {sos.status === 'RESPONDING' && (
                        <span className="text-warning flex items-center gap-1">
                          <Clock className="w-3 h-3 text-warning shrink-0 animate-spin duration-3000" /> ETA: {sos.eta} min
                        </span>
                      )}
                      {sos.status === 'RESOLVED' && (
                        <span className="text-muted">Closed {sos.created_at}</span>
                      )}
                    </div>

                  </div>
                </div>
              )
            })
          )}
        </div>

      </section>

      {/* ==========================================
          RIGHT COLUMN: INTERACTIVE PATIENT DOSSIER DRAWER
          ========================================== */}
      {activeDossier && (
        <aside className="w-full lg:w-96 shrink-0 bg-[#090E1A] border border-border rounded-xl flex flex-col justify-between overflow-hidden shadow-2xl relative">
          
          <div className="p-5 space-y-5 overflow-y-auto flex-1">
            
            {/* Header - dossier tag */}
            <div className="flex justify-between items-center border-b border-border/40 pb-3">
              <span className="px-2 py-0.5 text-[9px] font-extrabold bg-black text-primary border border-primary/20 rounded uppercase tracking-widest">
                Patient Dossier
              </span>
              <button 
                onClick={() => playTone(500, 'sine', 0.1, 0.05)}
                className="p-1 rounded text-muted hover:text-white"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Profile Avatar Card */}
            <div className="flex items-center gap-4 bg-surface/50 border border-border p-4 rounded-xl">
              <img 
                src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100" 
                alt="John Doe Photo" 
                className="w-12 h-12 rounded-lg object-cover border border-border"
              />
              <div>
                <h4 className="text-lg font-bold text-white tracking-wide">{activeDossier.citizen_name}</h4>
                <p className="text-[10px] text-muted font-semibold uppercase tracking-wider">ID: {activeDossier.citizen_id}</p>
                <span className="px-1.5 py-0.5 rounded text-[8px] font-extrabold bg-success/10 text-success border border-success/35 uppercase flex items-center gap-0.5 mt-1.5 w-max">
                  <UserCheck className="w-2.5 h-2.5" /> Verified Citizen
                </span>
              </div>
            </div>

            {/* Dispatch Location Grayscale snippet */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-[10px] text-muted font-bold tracking-wider uppercase">
                <span>Dispatch Location</span>
                <span className="text-white">{activeDossier.latitude.toFixed(4)}, {activeDossier.longitude.toFixed(4)}</span>
              </div>
              
              {/* Grayscale satellite screen map block */}
              <div className="h-28 bg-slate-900 border border-border rounded-lg relative overflow-hidden flex items-center justify-center font-bold text-xs uppercase text-slate-700 tracking-wider">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#151D30_1px,transparent_1px),linear-gradient(to_bottom,#151D30_1px,transparent_1px)] bg-[size:1rem_1rem]" />
                <div className="absolute w-6 h-6 rounded-full bg-danger/10 border border-danger/40 animate-ping" />
                <MapPin className="w-4.5 h-4.5 text-danger z-10 relative" />
                <span className="absolute bottom-2 left-2 text-[9px] bg-black/60 px-1.5 py-0.5 rounded text-white border border-border/80">
                  {activeDossier.village}
                </span>
              </div>
            </div>

            {/* Live Vitals tracking */}
            <div className="space-y-2.5">
              <span className="text-[10px] text-muted font-bold tracking-wider uppercase block">Live Vitals Monitoring</span>
              
              {/* Heart rate vitals */}
              <div className="p-3 bg-surface/50 border border-border rounded-lg space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted flex items-center gap-1 uppercase font-semibold">
                    <Heart className="w-3.5 h-3.5 text-danger animate-pulse shrink-0" /> Heart Rate
                  </span>
                  <strong className="text-sm font-bold text-white glow-red">{activeDossier.heart_rate} BPM</strong>
                </div>
                {/* Horizontal slider matching screenshot */}
                <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all duration-500 ${activeDossier.heart_rate > 120 ? 'bg-danger w-[85%]' : 'bg-success w-[60%]'}`} />
                </div>
              </div>

              {/* Body Temp Vitals */}
              <div className="p-3 bg-surface/50 border border-border rounded-lg space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted flex items-center gap-1 uppercase font-semibold">
                    <Thermometer className="w-3.5 h-3.5 text-warning shrink-0" /> Temperature
                  </span>
                  <strong className="text-sm font-bold text-white">{activeDossier.temperature} °C</strong>
                </div>
                <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-success w-[70%] rounded-full" />
                </div>
              </div>
            </div>

            {/* Urgent Logs Timeline */}
            <div className="space-y-2">
              <span className="text-[10px] text-muted font-bold tracking-wider uppercase flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-primary" /> Incident Timeline
              </span>
              <div className="p-3 bg-surfaceLight/30 border border-border rounded-lg space-y-2.5 max-h-36 overflow-y-auto">
                {activeDossier.urgent_logs.map((log, index) => (
                  <div key={index} className="text-[10.5px] text-slate-300 leading-relaxed border-l border-primary/40 pl-2">
                    {log}
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Dossier Bottom Command buttons */}
          <div className="p-5 border-t border-border bg-[#0C1425] flex flex-col gap-2">
            
            {/* Context action controls */}
            {activeDossier.status === 'PENDING' ? (
              <button 
                onClick={() => {
                  playWarningGong()
                  handleDispatchAction(activeDossier.id)
                }}
                className="w-full py-3 bg-white text-background font-extrabold text-xs uppercase tracking-wider rounded-lg hover:bg-slate-200 transition duration-150 shadow-md shadow-white/5 active:scale-[0.98]"
              >
                Dispatch Ambulance Unit
              </button>
            ) : activeDossier.status === 'RESPONDING' ? (
              <button 
                onClick={() => {
                  playSuccessArpeggio()
                  handleResolveAction(activeDossier.id)
                }}
                className="w-full py-3 bg-success text-white font-extrabold text-xs uppercase tracking-wider rounded-lg hover:bg-success-hover transition duration-150 shadow-md shadow-success/15 active:scale-[0.98]"
              >
                Force Resolve Emergency
              </button>
            ) : (
              <div className="w-full py-2.5 bg-slate-800 text-slate-400 font-bold text-xs uppercase tracking-wider rounded-lg text-center border border-slate-700">
                Incident Fully Closed
              </div>
            )}

            <button 
              onClick={() => {
                playTone(800, 'sine', 0.1, 0.05)
                alert(`Pulling complete medical history charts for citizen: ${activeDossier.citizen_name}`)
              }}
              className="w-full py-2.5 bg-transparent border border-border text-slate-300 hover:text-white hover:bg-surfaceLight/30 text-xs font-semibold rounded-lg uppercase tracking-wider transition"
            >
              Medical History
            </button>
          </div>

        </aside>
      )}

      {/* Triage drawer slider transitions */}
      <style jsx font-family="sans-serif">{`
        @keyframes scaleIn {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `}</style>

    </div>
  )
}
