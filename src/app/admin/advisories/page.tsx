'use client'

import React, { useState } from 'react'
import { 
  FileText, 
  Send, 
  Eye, 
  Smartphone, 
  AlertTriangle, 
  Sparkles, 
  Plus, 
  Clock, 
  Check, 
  Trash2,
  Bell,
  Heart
} from 'lucide-react'
import { useSentinelStore } from '@/lib/store'
import { playTone, playSuccessArpeggio } from '@/lib/audio'

export default function AdvisoriesCMS() {
  const advisories = useSentinelStore((state) => state.advisories)
  const createAdvisory = useSentinelStore((state) => state.createAdvisory)
  const updateAdvisoryStatus = useSentinelStore((state) => state.updateAdvisoryStatus)
  const soundEnabled = useSentinelStore((state) => state.soundEnabled)

  // Local state controls
  const [selectedAdvId, setSelectedAdvId] = useState<string>('ADV-01') // Default to boil water notice
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [category, setCategory] = useState<'CRITICAL' | 'WARNING' | 'ROUTINE'>('WARNING')
  const [status, setStatus] = useState<'DRAFT' | 'PUBLISHED'>('DRAFT')
  const [authoringMode, setAuthoringMode] = useState(false)

  // Active advisory object
  const activeAdvisory = advisories.find(a => a.id === selectedAdvId) || advisories[0]

  const handlePublishAdvisory = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !content.trim()) return

    createAdvisory({
      title,
      content,
      category,
      status
    })

    setAuthoringMode(false)
    setTitle('')
    setContent('')
    
    // Automatically select the newly created advisory
    setTimeout(() => {
      const latest = useSentinelStore.getState().advisories[0]
      if (latest) setSelectedAdvId(latest.id)
    }, 100)
  }

  const toggleStatus = (id: string, current: 'DRAFT' | 'PUBLISHED') => {
    const nextStatus = current === 'DRAFT' ? 'PUBLISHED' : 'DRAFT'
    updateAdvisoryStatus(id, nextStatus)
    playSuccessArpeggio()
  }

  return (
    <div className="h-[calc(100vh-10.5rem)] flex flex-col lg:flex-row gap-6">
      
      {/* ==========================================
          LEFT COLUMN: CMS COMPILER PANEL
          ========================================== */}
      <section className="flex-1 flex flex-col gap-4 overflow-hidden h-full">
        
        <div className="flex justify-between items-center shrink-0">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight font-sans">
              Advisories CMS
            </h1>
            <p className="text-xs text-muted mt-0.5">
              Draft and publish epidemiological notices and field tips directly to field health workers.
            </p>
          </div>

          <button 
            onClick={() => {
              playTone(650, 'sine', 0.1, 0.05)
              setAuthoringMode(!authoringMode)
            }}
            className="flex items-center gap-1.5 px-3 py-2 bg-surfaceLight/60 border border-border text-xs font-bold rounded-lg hover:text-primary transition"
          >
            <Plus className="w-4 h-4 text-primary" />
            <span>{authoringMode ? 'View Feed' : 'New Advisory'}</span>
          </button>
        </div>

        {/* Dynamic Authoring Editor vs Bulletins list */}
        <div className="flex-1 overflow-y-auto pr-1">
          {authoringMode ? (
            
            /* DRAFT AUTHORING COMPILER FORM */
            <div className="glass-card p-5 bg-surface/50 border border-border rounded-xl space-y-4 animate-scaleIn">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-primary" />
                Draft Epidemiological Advisory
              </h3>

              <form onSubmit={handlePublishAdvisory} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-300 font-bold mb-1.5 uppercase">Bulletin Title</label>
                  <input 
                    type="text" 
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Cholera Hygiene Protocol - Al-Zahra West"
                    className="w-full p-2.5 bg-surfaceLight border border-border rounded text-xs text-white placeholder-slate-500 focus:outline-none focus:border-primary"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-bold mb-1.5 uppercase">Threat Classification</label>
                    <select 
                      value={category}
                      onChange={(e) => setCategory(e.target.value as any)}
                      className="w-full p-2.5 bg-surfaceLight border border-border rounded text-xs text-white focus:outline-none"
                    >
                      <option value="CRITICAL">CRITICAL</option>
                      <option value="WARNING">WARNING</option>
                      <option value="ROUTINE">ROUTINE</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-bold mb-1.5 uppercase">Publish Status</label>
                    <select 
                      value={status}
                      onChange={(e) => setStatus(e.target.value as any)}
                      className="w-full p-2.5 bg-surfaceLight border border-border rounded text-xs text-white focus:outline-none font-bold"
                    >
                      <option value="DRAFT">DRAFT</option>
                      <option value="PUBLISHED">PUBLISHED IMMEDIATE</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1.5 uppercase">Instructional Content</label>
                  <textarea 
                    required
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full p-2.5 bg-surfaceLight border border-border rounded text-xs text-white placeholder-slate-500 focus:outline-none h-36"
                    placeholder="Type detailed health instructions for local ASHA workers and residents here..."
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button 
                    type="submit" 
                    className="flex-1 py-2.5 bg-primary text-background font-bold uppercase rounded-lg hover:bg-primary-hover transition duration-150 shadow-md shadow-primary/10"
                  >
                    Save Bulletin
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setAuthoringMode(false)}
                    className="flex-1 py-2.5 bg-transparent border border-border text-slate-300 hover:text-white rounded-lg transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>

          ) : (
            
            /* DRAFT FEED LIST */
            <div className="space-y-3.5">
              {advisories.map((adv) => {
                const isSelected = adv.id === selectedAdvId
                
                return (
                  <div 
                    key={adv.id}
                    onClick={() => {
                      playTone(500, 'sine', 0.08, 0.04)
                      setSelectedAdvId(adv.id)
                    }}
                    className={`p-4 rounded-xl border cursor-pointer relative transition duration-300 ${
                      isSelected 
                        ? 'bg-surface border-primary shadow-[0_4px_25px_rgba(0,240,255,0.06)]' 
                        : 'bg-surface/40 border-border/80 hover:border-border'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                      
                      <div className="flex gap-3">
                        <div className={`p-2 rounded-lg border flex items-center justify-center shrink-0 mt-0.5 ${
                          adv.category === 'CRITICAL' ? 'bg-danger/10 border-danger/25 text-danger' :
                          adv.category === 'WARNING' ? 'bg-warning/10 border-warning/25 text-warning' :
                          'bg-primary/10 border-primary/25 text-primary'
                        }`}>
                          <FileText className="w-4.5 h-4.5" />
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-xs font-bold text-white tracking-wide">{adv.title}</h3>
                            <span className={`px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase ${
                              adv.category === 'CRITICAL' ? 'bg-danger text-white animate-pulse' :
                              adv.category === 'WARNING' ? 'bg-warning text-background' :
                              'bg-primary/15 text-primary'
                            }`}>
                              {adv.category}
                            </span>
                          </div>
                          
                          <p className="text-[10.5px] text-slate-300 mt-1 truncate max-w-[280px]">
                            {adv.content}
                          </p>
                        </div>
                      </div>

                      {/* Workflow controls */}
                      <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 border-border/30 pt-2 sm:pt-0">
                        <span className="text-[10px] text-muted font-bold tracking-wider uppercase">
                          {adv.status}
                        </span>

                        <button 
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleStatus(adv.id, adv.status)
                          }}
                          className={`px-3 py-1 text-[9px] font-extrabold uppercase tracking-wider rounded transition-all duration-150 ${
                            adv.status === 'PUBLISHED' 
                              ? 'bg-slate-800 text-slate-400 hover:text-white border border-slate-700' 
                              : 'bg-primary text-background hover:bg-primary-hover shadow-sm shadow-primary/15'
                          }`}
                        >
                          {adv.status === 'PUBLISHED' ? 'Revoke' : 'Publish'}
                        </button>
                      </div>

                    </div>
                  </div>
                )
              })}
            </div>

          )}
        </div>

      </section>

      {/* ==========================================
          RIGHT COLUMN: RESIDENT PHONE APP PREVIEW
          ========================================== */}
      {activeAdvisory && (
        <aside className="w-full lg:w-96 shrink-0 flex flex-col items-center justify-center p-2.5">
          
          <div className="text-center mb-3">
            <span className="text-[9px] font-bold text-muted tracking-widest uppercase flex items-center gap-1.5 justify-center">
              <Smartphone className="w-3.5 h-3.5 text-primary" />
              Resident Phone App Preview
            </span>
          </div>

          {/* Smartphone device shell mockup */}
          <div className="w-72 h-[480px] bg-[#000000] border-4 border-slate-800 rounded-[30px] p-3 shadow-2xl relative flex flex-col justify-between overflow-hidden">
            
            {/* Phone Notch */}
            <div className="absolute top-0 inset-x-0 w-28 h-3.5 bg-slate-800 mx-auto rounded-b-xl z-20" />
            
            {/* Main Phone screen wrapper */}
            <div className="w-full h-full bg-[#080d19] rounded-[20px] p-3 overflow-y-auto flex flex-col justify-between relative border border-border/40 select-none">
              
              {/* Phone App Header */}
              <div>
                <div className="flex justify-between items-center text-[8px] text-slate-400 border-b border-border/40 pb-2 mb-4 pt-1">
                  <span className="font-bold flex items-center gap-0.5">
                    <Heart className="w-2.5 h-2.5 text-danger" /> PHC Connect
                  </span>
                  <span>16:40 PM</span>
                </div>

                {/* Simulated Content Card */}
                <div className="space-y-3">
                  
                  {/* Category warning banner */}
                  <div className={`p-2.5 rounded-lg border text-[10px] ${
                    activeAdvisory.category === 'CRITICAL' ? 'bg-danger/10 border-danger/30 text-danger-hover' :
                    activeAdvisory.category === 'WARNING' ? 'bg-warning/10 border-warning/30 text-warning' :
                    'bg-primary/5 border-primary/25 text-slate-300'
                  } flex items-start gap-2 leading-relaxed font-semibold`}>
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold block uppercase text-[8px] tracking-wider mb-0.5">{activeAdvisory.category} NOTICE</span>
                      {activeAdvisory.category === 'CRITICAL' ? 'High severity health advisory active in your village area.' : 'General health surveillance protocol advice.'}
                    </div>
                  </div>

                  {/* Bulletin Title */}
                  <h4 className="text-sm font-extrabold text-white leading-tight">
                    {activeAdvisory.title}
                  </h4>

                  {/* Bulleting body text */}
                  <p className="text-[10px] text-slate-300 leading-relaxed max-h-56 overflow-y-auto border-t border-border/20 pt-2 whitespace-pre-wrap font-medium">
                    {activeAdvisory.content}
                  </p>
                </div>
              </div>

              {/* Phone App Footer navigation */}
              <div className="border-t border-border/40 pt-2 mt-4 text-center">
                <span className="text-[7.5px] text-slate-500 font-extrabold tracking-widest uppercase">
                  Published {activeAdvisory.published_at || activeAdvisory.created_at}
                </span>
                
                <div className="h-1 w-24 bg-slate-700 rounded-full mx-auto mt-2" />
              </div>

            </div>

          </div>

        </aside>
      )}

      {/* Styled editor container animations */}
      <style jsx font-family="sans-serif">{`
        @keyframes scaleIn {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `}</style>

    </div>
  )
}
