'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Calendar, RefreshCw, Compass, ArrowUpRight, ShieldCheck, Heart, AlertCircle, Send, Check, Activity } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import DashboardStats from '@/components/features/DashboardStats'
import { useSentinelStore } from '@/lib/store'
import { playTone, playSuccessArpeggio } from '@/lib/audio'
import { formatCaseId } from '@/lib/utils/formatters'

// Dynamic trend data calculated in component
export default function RegionalOverview() {
  const symptomReports = useSentinelStore((state) => state.symptomReports)
  const sosRequests = useSentinelStore((state) => state.sosRequests)
  const advisories = useSentinelStore((state) => state.advisories)
  const updateSOSStatus = useSentinelStore((state) => state.updateSOSStatus)
  const soundEnabled = useSentinelStore((state) => state.soundEnabled)
  const currentUser = useSentinelStore((state) => state.currentUser)
  const fetchInitialReports = useSentinelStore((state) => state.fetchInitialReports)
  const subscribeToReports = useSentinelStore((state) => state.subscribeToReports)

  // Local state controls
  const router = useRouter()
  const fetchAdvisories = useSentinelStore((state) => state.fetchAdvisories)
  const subscribeToAdvisories = useSentinelStore((state) => state.subscribeToAdvisories)

  // Load advisories on mount and keep them in sync
  useEffect(() => {
    fetchAdvisories()
    subscribeToAdvisories()
  }, [])
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'core' | 'secondary'>('core')

  const handleRefresh = () => {
    setLoading(true)
    playTone(700, 'sine', 0.15, 0.05)
    fetchInitialReports().finally(() => {
      setLoading(false)
    })
  }

  useEffect(() => {
    fetchInitialReports()
    subscribeToReports()
  }, [])

  // Calculate dynamic trends based on reports inside our Zustand database
  const activeSOS = sosRequests.filter(s => s.status !== 'RESOLVED')
  
  const dynamicTrendData = React.useMemo(() => {
    const counts: Record<string, number> = {}
    symptomReports.forEach(r => {
      const datePart = r.timestamp.split(',')[0]
      if (datePart) {
        counts[datePart] = (counts[datePart] || 0) + 1
      }
    })
    
    // Sort chronologically (assuming current year, simple sort) or just output as is
    const sorted = Object.entries(counts)
      .map(([date, cases]) => ({ date, cases }))
      // .sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    
    // Reverse because symptomReports is newest-first, we want chronologically ascending for chart
    return sorted.reverse()
  }, [symptomReports])
  
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

  // Generate Realtime Operational Feed
  const operationalFeed = React.useMemo(() => {
    const feed: any[] = [];
    
    // 1. High-Risk Disease Events
    symptomReports.forEach(r => {
      if (r.severity === 'HIGH RISK' || r.severity === 'MODERATE') {
        const titleCat = r.clinical_category ? r.clinical_category.toLowerCase() : 'health';
        feed.push({
          id: `report-${r.id}`,
          type: 'report',
          title: `${r.severity === 'HIGH RISK' ? 'High-risk' : 'Moderate'} ${titleCat} report detected in ${r.origin || 'Bhogadi'}`,
          severity: r.severity === 'HIGH RISK' ? 'CRITICAL' : 'MODERATE',
          message: `Reported by ${r.reporter_name || 'ASHA Worker'}`,
          timestamp: r.timestamp,
          rawDate: new Date(r.timestamp)
        });
      }
    });

    // 2. Advisory Publications
    advisories.forEach(a => {
      feed.push({
        id: `adv-${a.id}`,
        type: 'advisory',
        title: a.title,
        severity: a.threat_level || 'INFO',
        message: a.category ? `${a.category} notice published` : 'Notice published',
        timestamp: a.created_at || new Date().toISOString(),
        rawDate: new Date(a.created_at || 0)
      });
    });

    // 3. Cluster Detection Events
    const wardMap: Record<string, { count: number, highRisk: number }> = {};
    symptomReports.filter(r => r.status !== 'RESOLVED').forEach(r => {
      const w = r.origin || 'Unknown';
      if (!wardMap[w]) wardMap[w] = { count: 0, highRisk: 0 };
      wardMap[w].count++;
      if (r.severity === 'HIGH RISK') wardMap[w].highRisk++;
    });

    Object.entries(wardMap).forEach(([ward, data]) => {
      if (data.count >= 3 && ward !== 'Unknown') {
        feed.push({
          id: `cluster-${ward}`,
          type: 'cluster',
          title: `Cluster monitoring activated in ${ward}`,
          severity: data.highRisk > 0 ? 'CRITICAL' : 'MODERATE',
          message: `${data.count} active cases under PHC observation`,
          timestamp: new Date().toISOString(),
          rawDate: new Date()
        });
      }
    });

    // Sort by newest first
    feed.sort((a, b) => b.rawDate.getTime() - a.rawDate.getTime());
    
    return feed;
  }, [symptomReports, advisories]);

  const getRelativeTime = (rawDate: Date) => {
    if (isNaN(rawDate.getTime())) return 'Recently';
    const diff = Math.floor((new Date().getTime() - rawDate.getTime()) / 1000);
    if (diff < 0) return 'Just now';
    if (diff < 60) return `${diff} secs ago`;
    const mins = Math.floor(diff / 60);
    if (mins < 60) return `${mins} mins ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    const days = Math.floor(hours / 24);
    if (days === 1) return `Yesterday`;
    if (days < 7) return `${days} days ago`;
    return rawDate.toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      
      {/* Title & Calendar dropdown row */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white font-sans">
            Bhogadi PHC Dashboard
          </h1>
          <p className="text-xs text-muted mt-0.5">
            Real-time epidemiological surveillance and ward-level monitoring across Bhogadi.
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
            <AreaChart data={dynamicTrendData.length > 0 ? dynamicTrendData : [{ date: 'Today', cases: 0 }]} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
        
        {/* LEFT COLUMN: Operations Feed */}
        <div className="lg:col-span-5 glass-card p-5 bg-surface/50 border border-border/80 rounded-xl flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Public Health Operations Feed</h3>
                <p className="text-[10px] text-muted">Realtime monitoring updates and field advisories</p>
              </div>
              <button 
                onClick={() => router.push('/admin/advisories')}
                className="text-[10px] font-bold text-primary flex items-center gap-0.5 hover:underline uppercase tracking-widest"
              >
                Full Report <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>

            {/* List entries */}
            <div className="space-y-3.5 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {operationalFeed.length === 0 ? (
                <div className="p-8 text-center border border-dashed border-border/60 rounded-xl text-xs text-muted flex flex-col items-center justify-center gap-2">
                  <ShieldCheck className="w-6 h-6 text-primary/50" />
                  <p>No active field surveillance updates currently available.</p>
                </div>
              ) : (
                operationalFeed.slice(0, 15).map((item) => (
                  <div key={item.id} className="flex gap-3 p-3 bg-surfaceLight/30 border border-border/40 rounded-lg hover:border-border/80 transition duration-150">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                      item.severity === 'CRITICAL' || item.severity === 'HIGH' ? 'bg-danger/10 border border-danger/25 text-danger' :
                      item.severity === 'MODERATE' || item.severity === 'WARNING' ? 'bg-warning/10 border border-warning/25 text-warning' :
                      'bg-primary/10 border border-primary/25 text-primary'
                    }`}>
                      {item.type === 'advisory' ? <ShieldCheck className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                    </div>
                    <div className="truncate w-full">
                      <div className="flex items-center gap-2 mb-0.5">
                        <h4 className="text-xs font-bold text-white truncate">{item.title}</h4>
                        <span className={`px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase shrink-0 ${
                          item.severity === 'CRITICAL' || item.severity === 'HIGH' ? 'bg-danger text-white' : 
                          item.severity === 'MODERATE' || item.severity === 'WARNING' ? 'bg-warning text-background' : 
                          'bg-slate-700 text-slate-300'
                        }`}>
                          {item.severity}
                        </span>
                      </div>
                      <p className="text-[10.5px] text-slate-300 truncate">
                        {item.message}
                      </p>
                      <span className="text-[9px] text-muted mt-1 block">{getRelativeTime(item.rawDate)}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          
          <div className="border-t border-border/40 mt-5 pt-3 text-[10px] text-muted uppercase tracking-wider text-center">
            Primary Health Centre Operations Feed
          </div>
        </div>

        {/* RIGHT COLUMN: Active SOS Monitor Queue */}
        <div className="lg:col-span-7 glass-card p-5 bg-surface/50 border border-border/80 rounded-xl">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-danger animate-pulse" />
                Active High-Risk Reports
              </h3>
              <p className="text-[10px] text-muted">Field response and case monitoring</p>
            </div>
            <span className="px-2 py-0.5 text-[9px] font-bold bg-danger/10 text-danger border border-danger/30 rounded-full tracking-widest uppercase animate-pulse">
              Outbreak Surveillance Active
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
                          {sos.village} • <span className="text-muted">{sos.latitude?.toFixed(4) ?? 'N/A'}, {sos.longitude?.toFixed(4) ?? 'N/A'}</span>
                        </p>
                      </div>
                    </div>

                    {/* Vitals Summary or Dispatch CTA */}
                    <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 border-border/40 pt-2.5 sm:pt-0">
                      
                      <div className="flex gap-2">
                      {sos.status === 'PENDING' || sos.status === 'SUBMITTED' ? (
                        <button 
                          onClick={() => {
                            updateSOSStatus(sos.id, 'RESPONDING', 'Response started for High-Risk case.')
                          }}
                          className="px-3.5 py-1.5 bg-white text-background font-bold text-[10px] tracking-wider uppercase rounded hover:bg-slate-200 transition flex items-center gap-1"
                        >
                          <Send className="w-3 h-3" />
                          START RESPONSE
                        </button>
                      ) : sos.status === 'RESPONDING' ? (
                        <button 
                          onClick={() => {
                            updateSOSStatus(sos.id, 'UNDER_OBSERVATION', 'Patient marked under treatment.')
                          }}
                          className="px-3.5 py-1.5 bg-warning text-background font-bold text-[10px] tracking-wider uppercase rounded hover:bg-yellow-500 transition flex items-center gap-1"
                        >
                          <Activity className="w-3 h-3" />
                          UNDER TREATMENT
                        </button>
                      ) : (
                        <button 
                          onClick={() => {
                            updateSOSStatus(sos.id, 'RESOLVED', 'Case officially closed.')
                          }}
                          className="px-3.5 py-1.5 bg-success text-white font-bold text-[10px] tracking-wider uppercase rounded hover:bg-success-hover transition flex items-center gap-1"
                        >
                          <Check className="w-3 h-3" />
                          CLOSE CASE
                        </button>
                      )}
                    </div>
                    </div>

                  </div>
                  
                  <div className="mt-3 flex items-center justify-between text-[9px] text-muted tracking-wider uppercase border-t border-border/30 pt-2">
                    <span>CASE ID: {formatCaseId(sos.citizen_id, 'BGD')}</span>
                    <span>REPORT TIME: {sos.created_at}</span>
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
