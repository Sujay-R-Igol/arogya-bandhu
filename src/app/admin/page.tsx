'use client'

import React, { useState, useEffect } from 'react'
import { Calendar, RefreshCw, Compass, ArrowUpRight, ShieldCheck, Heart, AlertCircle, Send, Check } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import DashboardStats from '@/components/features/DashboardStats'
import { useSentinelStore } from '@/lib/store'
import { playTone, playSuccessArpeggio } from '@/lib/audio'

// Seed trend data for Recharts matching "Symptom Prevalence Trends" 30-day roll
const trendData = [
  { date: 'Oct 24', cases: 12 },
  { date: 'Oct 28', cases: 18 },
  { date: 'Nov 01', cases: 14 },
  { date: 'Nov 05', cases: 22 },
  { date: 'Nov 09', cases: 16 },
  { date: 'Nov 12', cases: 42 }, // Peak activity reported
  { date: 'Nov 16', cases: 28 },
  { date: 'Nov 20', cases: 35 },
  { date: 'Nov 24', cases: 19 },
]

export default function RegionalOverview() {
  const symptomReports = useSentinelStore((state) => state.symptomReports)
  const sosRequests = useSentinelStore((state) => state.sosRequests)
  const advisories = useSentinelStore((state) => state.advisories)
  const dispatchSOS = useSentinelStore((state) => state.dispatchSOS)
  const resolveSOS = useSentinelStore((state) => state.resolveSOS)
  const soundEnabled = useSentinelStore((state) => state.soundEnabled)
  const currentUser = useSentinelStore((state) => state.currentUser)

  // Local state controls
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'core' | 'secondary'>('core')

  const handleRefresh = () => {
    setLoading(true)
    playTone(700, 'sine', 0.15, 0.05)
    setTimeout(() => {
      setLoading(false)
    }, 600)
  }

  // Calculate dynamic trends based on reports inside our Zustand database
  const activeSOS = sosRequests.filter(s => s.status !== 'RESOLVED')
  
  // Custom tooltips for premium GIS styling
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-3 bg-surface border border-border shadow-xl rounded-lg text-xs">
          <p className="text-muted font-semibold">{payload[0].payload.date}</p>
          <p className="text-primary font-bold mt-1">
            {payload[0].value} Cases Reported
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="space-y-6">
      
      {/* Title & Calendar dropdown row */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white font-sans">
            Regional Health Overview
          </h1>
          <p className="text-xs text-muted mt-0.5">
            Real-time clinical intelligence and spatial signal metrics across 12 monitoring sectors.
          </p>
        </div>

        {/* Date Selector and Refresh controls */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5 px-3 py-2 bg-[#090E1A] border border-border rounded-lg text-xs font-semibold cursor-pointer hover:bg-surfaceLight/40 transition">
            <Calendar className="w-3.5 h-3.5 text-primary" />
            <span className="text-slate-300">Oct 24 - Nov 23, 2026</span>
          </div>

          <button 
            onClick={handleRefresh}
            disabled={loading}
            className="p-2.5 bg-[#090E1A] border border-border rounded-lg hover:bg-surfaceLight/40 active:scale-95 transition disabled:opacity-50"
            title="Refresh clinical database"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-muted hover:text-white ${loading ? 'animate-spin text-primary' : ''}`} />
          </button>
        </div>
      </div>

      {/* KPI Stats Analytics Panel */}
      <DashboardStats />

      {/* Recharts Prevalence Trend chart */}
      <div className="glass-card p-5 bg-surface/50 border border-border/80 rounded-xl relative overflow-hidden">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Symptom Prevalence Trends
            </h2>
            <p className="text-[11px] text-muted mt-0.5">
              Rolling 30-day aggregate monitoring of top clinical outbreak signals.
            </p>
          </div>

          {/* Toggle Indicators */}
          <div className="flex bg-[#090E1A] border border-border rounded-lg p-0.5 text-[10px] font-bold">
            <button 
              onClick={() => setActiveTab('core')}
              className={`px-3 py-1 rounded transition ${activeTab === 'core' ? 'bg-surfaceLight text-primary' : 'text-slate-400 hover:text-white'}`}
            >
              Core Indicators
            </button>
            <button 
              onClick={() => setActiveTab('secondary')}
              className={`px-3 py-1 rounded transition ${activeTab === 'secondary' ? 'bg-surfaceLight text-primary' : 'text-slate-400 hover:text-white'}`}
            >
              Secondary Markers
            </button>
          </div>
        </div>

        {/* Chart plot wrapper */}
        <div className="h-64 w-full relative">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorCases" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00F0FF" stopOpacity={0.25}/>
                  <stop offset="95%" stopColor="#00F0FF" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E2942" vertical={false} />
              <XAxis 
                dataKey="date" 
                stroke="#8A99AD" 
                fontSize={10} 
                tickLine={false} 
                axisLine={false}
              />
              <YAxis 
                stroke="#8A99AD" 
                fontSize={10} 
                tickLine={false} 
                axisLine={false}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#2C3A5A', strokeWidth: 1 }} />
              <Area 
                type="monotone" 
                dataKey="cases" 
                stroke="#00F0FF" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorCases)" 
              />
            </AreaChart>
          </ResponsiveContainer>

          {/* Floating Compass HUD icon */}
          <button 
            onClick={() => {
              playTone(880, 'sine', 0.1, 0.05)
              router.push('/admin/map')
            }}
            className="absolute bottom-4 right-4 p-3 bg-surfaceLight border border-border rounded-full hover:border-primary/50 text-slate-300 hover:text-primary transition shadow-xl cursor-pointer"
            title="Open Live Outbreak Map"
          >
            <Compass className="w-5 h-5 animate-pulse" />
          </button>
        </div>
      </div>

      {/* Grid columns: Recent Activity Feed & Active SOS Requests */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: Intelligence Feed (Advisories & Clusters) */}
        <div className="lg:col-span-5 glass-card p-5 bg-surface/50 border border-border/80 rounded-xl flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Intelligence Feed</h3>
                <p className="text-[10px] text-muted">Surveillance audits and bulletins</p>
              </div>
              <button 
                onClick={() => router.push('/admin/advisories')}
                className="text-[10px] font-bold text-primary flex items-center gap-0.5 hover:underline uppercase tracking-widest"
              >
                Full Report <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>

            {/* List entries */}
            <div className="space-y-3.5">
              
              {/* Core cholera seed */}
              <div className="flex gap-3 p-3 bg-surfaceLight/30 border border-border/40 rounded-lg hover:border-border/80 transition duration-150">
                <div className="w-8 h-8 rounded-lg bg-danger/10 border border-danger/25 flex items-center justify-center shrink-0 mt-0.5">
                  <AlertCircle className="w-4 h-4 text-danger animate-pulse" />
                </div>
                <div className="truncate">
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold text-white">Suspected Cholera Cluster</h4>
                    <span className="px-1.5 py-0.5 rounded text-[8px] font-extrabold bg-danger text-white uppercase">CRITICAL</span>
                  </div>
                  <p className="text-[10.5px] text-slate-300 mt-0.5">North Province • Active Tracking • 2h ago</p>
                </div>
              </div>

              {/* Core Influenza Alpha seed */}
              <div className="flex gap-3 p-3 bg-surfaceLight/30 border border-border/40 rounded-lg hover:border-border/80 transition duration-150">
                <div className="w-8 h-8 rounded-lg bg-warning/10 border border-warning/25 flex items-center justify-center shrink-0 mt-0.5">
                  <AlertCircle className="w-4 h-4 text-warning" />
                </div>
                <div className="truncate">
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold text-white">Influenza Alpha Spike</h4>
                    <span className="px-1.5 py-0.5 rounded text-[8px] font-extrabold bg-warning text-background uppercase">MODERATE</span>
                  </div>
                  <p className="text-[10.5px] text-slate-300 mt-0.5">Central Valley • Surveillance • 5h ago</p>
                </div>
              </div>

              {/* Dynamic Advisories list */}
              {advisories.slice(0, 2).map((adv) => (
                <div key={adv.id} className="flex gap-3 p-3 bg-surfaceLight/30 border border-border/40 rounded-lg hover:border-border/80 transition duration-150">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/25 flex items-center justify-center shrink-0 mt-0.5">
                    <ShieldCheck className="w-4 h-4 text-primary" />
                  </div>
                  <div className="truncate">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-white truncate max-w-[180px]">{adv.title}</h4>
                      <span className={`px-1.5 py-0.5 rounded text-[8px] font-extrabold ${
                        adv.category === 'CRITICAL' ? 'bg-danger text-white' : 
                        adv.category === 'WARNING' ? 'bg-warning text-background' : 
                        'bg-slate-700 text-slate-300'
                      } uppercase`}>
                        {adv.category}
                      </span>
                    </div>
                    <p className="text-[10.5px] text-slate-300 mt-0.5 truncate max-w-[280px]">
                      {adv.content}
                    </p>
                    <span className="text-[9px] text-muted mt-1 block">{adv.published_at || adv.created_at}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="border-t border-border/40 mt-5 pt-3 text-[10px] text-muted uppercase tracking-wider text-center">
            Sentinel operations room feed
          </div>
        </div>

        {/* RIGHT COLUMN: Active SOS Monitor Queue */}
        <div className="lg:col-span-7 glass-card p-5 bg-surface/50 border border-border/80 rounded-xl">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-danger animate-pulse" />
                Active SOS Monitor
              </h3>
              <p className="text-[10px] text-muted">First-response emergency triage board</p>
            </div>
            <span className="px-2 py-0.5 text-[9px] font-bold bg-danger/10 text-danger border border-danger/30 rounded-full tracking-widest uppercase animate-pulse">
              Live Response Active
            </span>
          </div>

          {/* SOS Cards queue */}
          <div className="space-y-3.5">
            {activeSOS.length === 0 ? (
              <div className="p-12 text-center border border-dashed border-border/60 rounded-xl text-xs text-muted flex flex-col items-center justify-center gap-2">
                <ShieldCheck className="w-8 h-8 text-success" />
                <span>All health sectors fully clear. Zero pending SOS requests.</span>
              </div>
            ) : (
              activeSOS.slice(0, 3).map((sos) => (
                <div 
                  key={sos.id} 
                  className={`p-4 rounded-xl border relative transition duration-300 ${
                    sos.status === 'PENDING' 
                      ? 'bg-danger/5 border-danger/40 hover:border-danger/60 animate-border-glow' 
                      : 'bg-surfaceLight/30 border-border/80'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    
                    {/* Urgency indicator & Location */}
                    <div className="flex items-start gap-3">
                      <div className={`p-2.5 rounded-lg border flex items-center justify-center shrink-0 mt-0.5 ${
                        sos.status === 'PENDING' ? 'bg-danger/15 border-danger/40 text-danger animate-pulse' : 'bg-primary/10 border-primary/20 text-primary'
                      }`}>
                        {sos.status === 'PENDING' ? <AlertCircle className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-white">{sos.citizen_name}</h4>
                          <span className={`px-1.5 py-0.5 rounded text-[8px] font-extrabold ${
                            sos.status === 'PENDING' ? 'bg-danger text-white animate-pulse' : 'bg-warning text-background'
                          }`}>
                            {sos.status}
                          </span>
                        </div>
                        <p className="text-[10.5px] text-slate-300 mt-1">
                          {sos.village} • <span className="text-muted">{sos.latitude.toFixed(4)}, {sos.longitude.toFixed(4)}</span>
                        </p>
                      </div>
                    </div>

                    {/* Vitals Summary or Dispatch CTA */}
                    <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 border-border/40 pt-2.5 sm:pt-0">
                      
                      {/* Vitals summary HUD */}
                      <div className="flex gap-3 text-xs">
                        <div className="flex items-center gap-1.5">
                          <Heart className="w-3.5 h-3.5 text-danger shrink-0" />
                          <span className="font-semibold text-white">{sos.heart_rate}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] text-muted font-bold">TEMP:</span>
                          <span className="font-semibold text-slate-200">{sos.temperature}°C</span>
                        </div>
                      </div>

                      {/* Dispatch Trigger CTA button */}
                      {sos.status === 'PENDING' ? (
                        <button 
                          onClick={() => {
                            dispatchSOS(sos.id, '04:12')
                          }}
                          className="px-3.5 py-1.5 bg-[#FF3B30] text-white font-bold text-[10px] tracking-wider uppercase rounded hover:bg-danger-hover transition shadow-sm shadow-danger/25"
                        >
                          DISPATCH
                        </button>
                      ) : (
                        <button 
                          onClick={() => {
                            resolveSOS(sos.id, currentUser.name)
                          }}
                          className="px-3.5 py-1.5 bg-success text-white font-bold text-[10px] tracking-wider uppercase rounded hover:bg-success-hover transition flex items-center gap-1"
                        >
                          <Check className="w-3 h-3" />
                          RESOLVE
                        </button>
                      )}

                    </div>

                  </div>
                  
                  {/* Wait timeline snippet */}
                  <div className="mt-3 flex items-center justify-between text-[9px] text-muted tracking-wider uppercase border-t border-border/30 pt-2">
                    <span>CITIZEN ID: {sos.citizen_id}</span>
                    <span>WAIT TIME: {sos.created_at}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  )
}
