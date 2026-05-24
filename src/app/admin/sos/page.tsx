'use client'

import React, { useState } from 'react'
import { 
  AlertTriangle, 
  Clock, 
  MapPin, 
  Check, 
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
  const updateSOSStatus = useSentinelStore((state) => state.updateSOSStatus)
  const currentUser = useSentinelStore((state) => state.currentUser)

  // Local state controls
  const [selectedSosId, setSelectedSosId] = useState<string>('CI-9924') // Default to John Doe CI-9924
  const [searchQuery, setSearchQuery] = useState('')
  const [etaValue, setEtaValue] = useState('04:12')

  // Find currently active dossier object
  const activeDossier = sosRequests.find((s) => s.id === selectedSosId) || sosRequests[0]

  // Filter queue items matching query
  const filteredQueue = sosRequests.filter((sos) => {
    if (sos.status === 'RESOLVED') return false;
    const text = searchQuery.toLowerCase().trim()
    return (
      !text ||
      String(sos.citizen_name).toLowerCase().includes(text) ||
      String(sos.citizen_id).toLowerCase().includes(text) ||
      String(sos.village).toLowerCase().includes(text)
    )
  })

  const handleAction = async (id: string, newStatus: 'PENDING' | 'RESPONDING' | 'UNDER_OBSERVATION' | 'RESOLVED', logMessage: string) => {
    await updateSOSStatus(id, newStatus, logMessage);
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
                            (sos.status === 'PENDING' || sos.status === 'SUBMITTED') ? 'bg-danger text-white animate-pulse' :
                            sos.status === 'RESPONDING' ? 'bg-warning text-background' :
                            sos.status === 'UNDER_OBSERVATION' ? 'bg-blue-500/20 text-blue-400' :
                            'bg-slate-700 text-slate-300'
                          }`}>
                            {sos.status === 'RESPONDING' ? 'ASHA/PHC TEAM ASSIGNED' : sos.status}
                          </span>

                          <span className="text-[10px] text-primary/70 font-bold tracking-widest uppercase">
                            {sos.citizen_id}
                          </span>
                        </div>

                        <p className="text-[11px] text-slate-300 mt-1 flex items-center gap-1 font-semibold">
                          <MapPin className="w-3.5 h-3.5 text-muted shrink-0" />
                          <span>{sos.village === 'Unknown' ? 'Ward Not Classified' : sos.village}</span>
                        </p>
                      </div>
                    </div>

                    {/* Wait timer / Details status */}
                    <div className="text-right text-[10px] text-muted tracking-wider uppercase font-semibold">
                      {(sos.status === 'PENDING' || sos.status === 'SUBMITTED') && (
                        <span className="text-danger flex items-center gap-1">
                          <Clock className="w-3 h-3 text-danger shrink-0" /> REPORTED {sos.created_at}
                        </span>
                      )}
                      {sos.status === 'RESPONDING' && (
                        <span className="text-warning flex items-center gap-1">
                          <Clock className="w-3 h-3 text-warning shrink-0 animate-spin duration-3000" /> RESPONDING
                        </span>
                      )}
                      {sos.status === 'UNDER_OBSERVATION' && (
                        <span className="text-blue-400 flex items-center gap-1">
                          <Activity className="w-3 h-3 shrink-0" /> UNDER REVIEW
                        </span>
                      )}
                      {sos.status === 'RESOLVED' && (
                        <span className="text-muted">RESOLVED</span>
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
            <div className="flex flex-col gap-2 bg-surface/50 border border-border p-4 rounded-xl">
              <div>
                <h4 className="text-lg font-bold text-white tracking-wide">{activeDossier.citizen_name}</h4>
                <p className="text-[10px] text-muted font-semibold uppercase tracking-wider">Case ID: {activeDossier.citizen_id}</p>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-border/40">
                <div>
                  <span className="text-[9px] text-muted uppercase tracking-wider">Symptom/Disease</span>
                  <p className="text-xs font-bold text-slate-200 uppercase">{activeDossier.disease}</p>
                </div>
                <div>
                  <span className="text-[9px] text-muted uppercase tracking-wider">Severity</span>
                  <p className={`text-xs font-bold uppercase ${activeDossier.severity === 'HIGH RISK' ? 'text-danger glow-red' : activeDossier.severity === 'MODERATE' ? 'text-warning' : 'text-success'}`}>{activeDossier.severity}</p>
                </div>
                <div className="col-span-2">
                  <span className="text-[9px] text-muted uppercase tracking-wider">Contact Number</span>
                  <p className="text-xs font-bold text-slate-200">{activeDossier.contact_number}</p>
                </div>
              </div>
            </div>

            {/* Dispatch Location Grayscale snippet */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-[10px] text-muted font-bold tracking-wider uppercase">
                <span>Dispatch Location</span>
                <span className="text-white">{(activeDossier.latitude ?? 0).toFixed(4)}, {(activeDossier.longitude ?? 0).toFixed(4)}</span>
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



            {/* Urgent Logs Timeline */}
            <div className="space-y-2">
              <span className="text-[10px] text-muted font-bold tracking-wider uppercase flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-primary" /> Case Timeline
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
            {activeDossier.status === 'PENDING' || activeDossier.status === 'SUBMITTED' ? (
              activeDossier.severity === 'HIGH RISK' ? (
                <>
                  <button 
                    onClick={() => { playWarningGong(); handleAction(activeDossier.id, 'RESPONDING', 'Start Response initiated for High-Risk outbreak.'); }}
                    className="w-full py-2.5 bg-white text-background font-extrabold text-xs uppercase tracking-wider rounded-lg hover:bg-slate-200 transition shadow-md shadow-white/5"
                  >Start Response</button>
                  <button 
                    onClick={() => { playWarningGong(); handleAction(activeDossier.id, 'RESPONDING', 'Field Team assigned to coordinate immediate response.'); }}
                    className="w-full py-2.5 bg-danger text-white font-extrabold text-xs uppercase tracking-wider rounded-lg hover:bg-red-600 transition shadow-md shadow-danger/20"
                  >Assign Field Team</button>
                </>
              ) : activeDossier.severity === 'MODERATE' ? (
                <>
                  <button 
                    onClick={() => { playSuccessArpeggio(); handleAction(activeDossier.id, 'RESPONDING', 'ASHA Worker assigned for field follow-up.'); }}
                    className="w-full py-2.5 bg-warning text-background font-extrabold text-xs uppercase tracking-wider rounded-lg hover:bg-yellow-500 transition shadow-md shadow-warning/15"
                  >Assign ASHA Follow-Up</button>
                  <button 
                    onClick={() => { playSuccessArpeggio(); handleAction(activeDossier.id, 'RESPONDING', 'Scheduled for PHC Clinical Review.'); }}
                    className="w-full py-2.5 bg-primary text-background font-extrabold text-xs uppercase tracking-wider rounded-lg hover:bg-cyan-500 transition shadow-md shadow-primary/15"
                  >Schedule PHC Review</button>
                  <button 
                    onClick={() => { playTone(600, 'sine', 0.1, 0.05); handleAction(activeDossier.id, 'UNDER_OBSERVATION', 'Village Advisory issued for moderate outbreak risk.'); }}
                    className="w-full py-2.5 bg-transparent border border-border text-slate-300 hover:text-white hover:bg-surfaceLight/30 font-extrabold text-xs uppercase tracking-wider rounded-lg transition"
                  >Issue Village Advisory</button>
                </>
              ) : (
                <>
                  <button 
                    onClick={() => { playSuccessArpeggio(); handleAction(activeDossier.id, 'RESPONDING', 'ASHA Worker assigned for routine follow-up.'); }}
                    className="w-full py-2.5 bg-warning text-background font-extrabold text-xs uppercase tracking-wider rounded-lg hover:bg-yellow-500 transition shadow-md shadow-warning/15"
                  >Assign ASHA Follow-Up</button>
                  <button 
                    onClick={() => { playSuccessArpeggio(); handleAction(activeDossier.id, 'UNDER_OBSERVATION', 'Hygiene Advisory sent to citizen contact.'); }}
                    className="w-full py-2.5 bg-primary text-background font-extrabold text-xs uppercase tracking-wider rounded-lg hover:bg-cyan-500 transition shadow-md shadow-primary/15"
                  >Send Hygiene Advisory</button>
                  <button 
                    onClick={() => { playTone(600, 'sine', 0.1, 0.05); handleAction(activeDossier.id, 'UNDER_OBSERVATION', 'Marked under observation.'); }}
                    className="w-full py-2.5 bg-transparent border border-border text-slate-300 hover:text-white hover:bg-surfaceLight/30 font-extrabold text-xs uppercase tracking-wider rounded-lg transition"
                  >Mark Under Observation</button>
                </>
              )
            ) : activeDossier.status === 'RESPONDING' ? (
              <>
                <button 
                  onClick={() => { playSuccessArpeggio(); handleAction(activeDossier.id, 'UNDER_OBSERVATION', 'Patient marked under treatment.'); }}
                  className="w-full py-3 bg-warning text-background font-extrabold text-xs uppercase tracking-wider rounded-lg hover:bg-yellow-500 transition duration-150 shadow-md shadow-warning/15 active:scale-[0.98]"
                >Mark Under Treatment</button>
              </>
            ) : activeDossier.status === 'UNDER_OBSERVATION' ? (
              <button 
                onClick={() => { playSuccessArpeggio(); handleAction(activeDossier.id, 'RESOLVED', 'Case officially resolved and closed by CHO.'); }}
                className="w-full py-3 bg-success text-white font-extrabold text-xs uppercase tracking-wider rounded-lg hover:bg-success-hover transition duration-150 shadow-md shadow-success/15 active:scale-[0.98]"
              >Close Case File</button>
            ) : (
              <div className="w-full py-2.5 bg-slate-800 text-slate-400 font-bold text-xs uppercase tracking-wider rounded-lg text-center border border-slate-700">Incident Fully Closed</div>
            )}
            
            <button 
              onClick={() => { playTone(800, 'sine', 0.1, 0.05); alert(`Pulling recent field notes and observations for case: ${activeDossier.citizen_name}`); }}
              className="w-full py-2.5 mt-2 bg-transparent border border-border text-slate-300 hover:text-white hover:bg-surfaceLight/30 text-xs font-semibold rounded-lg uppercase tracking-wider transition"
            >Recent Field Notes</button>
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
