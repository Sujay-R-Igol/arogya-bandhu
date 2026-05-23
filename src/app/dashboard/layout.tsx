'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { 
  Shield, 
  LayoutDashboard, 
  Database, 
  Map, 
  AlertOctagon, 
  FileText, 
  Volume2, 
  VolumeX, 
  Bell, 
  Settings, 
  HelpCircle, 
  Power,
  Activity,
  Play,
  Pause,
  AlertTriangle,
  Heart,
  Thermometer,
  ShieldCheck,
  Search,
  ChevronRight,
  X
} from 'lucide-react'
import { useSentinelStore } from '@/lib/store'
import { stopEmergencyAlarm, playTone } from '@/lib/audio'

export default function DashboardLayout({
  children
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()

  // State bindings from global Zustand store
  const currentUser = useSentinelStore((state) => state.currentUser)
  const systemConnected = useSentinelStore((state) => state.systemConnected)
  const soundEnabled = useSentinelStore((state) => state.soundEnabled)
  const setSoundEnabled = useSentinelStore((state) => state.setSoundEnabled)
  const simulationActive = useSentinelStore((state) => state.simulationActive)
  const setSimulationActive = useSentinelStore((state) => state.setSimulationActive)
  const sosRequests = useSentinelStore((state) => state.sosRequests)
  const activeSOSAlert = useSentinelStore((state) => state.activeSOSAlert)
  const setActiveSOSAlert = useSentinelStore((state) => state.setActiveSOSAlert)
  const dispatchSOS = useSentinelStore((state) => state.dispatchSOS)
  const resolveSOS = useSentinelStore((state) => state.resolveSOS)
  const notifications = useSentinelStore((state) => state.notifications)
  const markNotificationsAsRead = useSentinelStore((state) => state.markNotificationsAsRead)
  const clearNotification = useSentinelStore((state) => state.clearNotification)
  const symptomReports = useSentinelStore((state) => state.symptomReports)

  // Local state controls
  const [notifOpen, setNotifOpen] = useState(false)
  const [etaValue, setEtaValue] = useState('04:15')

  const pendingSOSCount = sosRequests.filter(s => s.status === 'PENDING').length
  const unreadNotifCount = notifications.filter(n => !n.read).length

  // Force close overlay if all SOS are responding/resolved
  useEffect(() => {
    if (activeSOSAlert && !sosRequests.some(s => s.id === activeSOSAlert.id && s.status === 'PENDING')) {
      setActiveSOSAlert(null)
    }
  }, [sosRequests, activeSOSAlert, setActiveSOSAlert])

  const handleEtaDispatch = (id: string) => {
    dispatchSOS(id, etaValue)
    setActiveSOSAlert(null)
  }

  const handleDismissAlert = (id: string) => {
    // If they dismiss the popup, we silences the active siren but keep it pending in queue
    stopEmergencyAlarm()
    setActiveSOSAlert(null)
  }

  return (
    <div className="flex min-h-screen bg-background text-slate-100 overflow-hidden">
      
      {/* ==========================================
          SIDEBAR NAVIGATION (Deep Navy & Slick)
          ========================================== */}
      <aside className="w-64 bg-[#090E1A] border-r border-border shrink-0 flex flex-col justify-between z-20">
        <div>
          {/* Header Brand */}
          <div className="p-6 border-b border-border flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-surface border border-primary/20 flex items-center justify-center">
              <Shield className="w-5 h-5 text-primary glow-cyan" />
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-wider text-white">Sentinel</h2>
              <p className="text-[10px] text-muted font-semibold uppercase tracking-widest">Clinical Intelligence</p>
            </div>
          </div>

          {/* Nav Menu */}
          <nav className="p-4 space-y-1.5">
            <Link href="/dashboard" className={`flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              pathname === '/dashboard' 
                ? 'bg-surfaceLight text-primary border-l-2 border-primary shadow-lg shadow-primary/5' 
                : 'text-slate-300 hover:bg-surfaceLight/50 hover:text-white'
            }`}>
              <div className="flex items-center gap-3">
                <LayoutDashboard className="w-4.5 h-4.5" />
                <span>Dashboard Overview</span>
              </div>
            </Link>

            <Link href="/dashboard/reports" className={`flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              pathname === '/dashboard/reports' 
                ? 'bg-surfaceLight text-primary border-l-2 border-primary shadow-lg shadow-primary/5' 
                : 'text-slate-300 hover:bg-surfaceLight/50 hover:text-white'
            }`}>
              <div className="flex items-center gap-3">
                <Database className="w-4.5 h-4.5" />
                <span>Symptom Database</span>
              </div>
            </Link>

            <Link href="/dashboard/map" className={`flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              pathname === '/dashboard/map' 
                ? 'bg-surfaceLight text-primary border-l-2 border-primary shadow-lg shadow-primary/5' 
                : 'text-slate-300 hover:bg-surfaceLight/50 hover:text-white'
            }`}>
              <div className="flex items-center gap-3">
                <Map className="w-4.5 h-4.5" />
                <span>Live Outbreak Map</span>
              </div>
            </Link>

            <Link href="/dashboard/sos" className={`flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              pathname === '/dashboard/sos' 
                ? 'bg-surfaceLight text-primary border-l-2 border-primary shadow-lg shadow-primary/5' 
                : 'text-slate-300 hover:bg-surfaceLight/50 hover:text-white'
            }`}>
              <div className="flex items-center gap-3">
                <AlertOctagon className="w-4.5 h-4.5" />
                <span>SOS Queue</span>
              </div>
              {pendingSOSCount > 0 && (
                <span className="px-2 py-0.5 text-[10px] font-bold bg-danger text-white rounded-full animate-pulse shadow-sm shadow-danger/30">
                  {pendingSOSCount}
                </span>
              )}
            </Link>

            <Link href="/dashboard/advisories" className={`flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              pathname === '/dashboard/advisories' 
                ? 'bg-surfaceLight text-primary border-l-2 border-primary shadow-lg shadow-primary/5' 
                : 'text-slate-300 hover:bg-surfaceLight/50 hover:text-white'
            }`}>
              <div className="flex items-center gap-3">
                <FileText className="w-4.5 h-4.5" />
                <span>Advisories CMS</span>
              </div>
            </Link>
          </nav>
        </div>

        {/* Sidebar Footer Controls & Profile Card */}
        <div className="p-4 border-t border-border space-y-4">
          
          {/* Quick Settings Panel (Sound & Simulators) */}
          <div className="flex flex-col gap-2 p-2 rounded-lg bg-surface/50 border border-border/40 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-muted font-medium flex items-center gap-1.5">
                {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-primary" /> : <VolumeX className="w-3.5 h-3.5 text-muted" />}
                Sound System
              </span>
              <button 
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`w-7 h-4 rounded-full transition-all relative ${soundEnabled ? 'bg-primary' : 'bg-slate-700'}`}
              >
                <div className={`absolute top-0.5 w-3 h-3 bg-[#090E1A] rounded-full transition-all ${soundEnabled ? 'right-0.5' : 'left-0.5'}`} />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-muted font-medium flex items-center gap-1.5">
                {simulationActive ? <Play className="w-3.5 h-3.5 text-success animate-pulse" /> : <Pause className="w-3.5 h-3.5 text-muted" />}
                ASHA Simulator
              </span>
              <button 
                onClick={() => setSimulationActive(!simulationActive)}
                className={`w-7 h-4 rounded-full transition-all relative ${simulationActive ? 'bg-success' : 'bg-slate-700'}`}
              >
                <div className={`absolute top-0.5 w-3 h-3 bg-[#090E1A] rounded-full transition-all ${simulationActive ? 'right-0.5' : 'left-0.5'}`} />
              </button>
            </div>
          </div>

          {/* Profile Badge card */}
          <div className="flex items-center gap-3 p-2 bg-[#0C1425] rounded-xl border border-border/80">
            <img 
              src={currentUser.image} 
              alt={currentUser.name} 
              className="w-10 h-10 rounded-lg object-cover border border-border"
            />
            <div className="truncate">
              <h4 className="text-xs font-bold text-white truncate">{currentUser.name}</h4>
              <p className="text-[10px] text-muted font-semibold truncate">{currentUser.title}</p>
            </div>
            <button 
              onClick={() => {
                stopEmergencyAlarm()
                router.push('/')
              }}
              title="Sign Out Console"
              className="p-1 rounded-md text-muted hover:text-danger hover:bg-surfaceLight/50 ml-auto transition duration-150"
            >
              <Power className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* ==========================================
          MAIN AREA (Content Shell, Header, Ticker)
          ========================================== */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        
        {/* TOP OPERATIONS HEADER */}
        <header className="h-16 border-b border-border bg-[#090E1A] px-6 flex items-center justify-between z-10">
          
          {/* Header left - Search bar */}
          <div className="relative w-96">
            <Search className="absolute left-3 inset-y-0 my-auto w-4 h-4 text-muted" />
            <input 
              type="text" 
              placeholder="Global sentinel search..." 
              className="w-full pl-9 pr-4 py-1.5 text-xs bg-surfaceLight/40 border border-border rounded-lg placeholder-slate-500 text-white focus:outline-none focus:border-primary/80 focus:bg-surfaceLight/60 transition duration-150"
            />
          </div>

          {/* Header right - Connected state, notifications bell, settings */}
          <div className="flex items-center gap-6">
            
            {/* Realtime status light */}
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full relative flex`}>
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${systemConnected ? 'bg-success' : 'bg-warning'}`} />
                <span className={`relative inline-flex rounded-full h-2 w-2 ${systemConnected ? 'bg-success' : 'bg-warning'}`} />
              </span>
              <span className="text-[11px] text-slate-300 font-semibold tracking-wide">
                System Status: {systemConnected ? 'Connected' : 'Offline'}
              </span>
            </div>

            {/* Notification bell dropdown toggle */}
            <div className="relative">
              <button 
                onClick={() => {
                  setNotifOpen(!notifOpen)
                  if (!notifOpen) markNotificationsAsRead()
                }}
                className="relative p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-surfaceLight/60 transition duration-150"
              >
                <Bell className="w-4.5 h-4.5" />
                {unreadNotifCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-danger animate-pulse" />
                )}
              </button>

              {/* Notification Panel */}
              {notifOpen && (
                <div className="absolute right-0 mt-3 w-80 glass-card shadow-2xl border border-border overflow-hidden z-30">
                  <div className="p-3 border-b border-border bg-[#0C1425] flex justify-between items-center">
                    <span className="text-xs font-bold text-white uppercase tracking-wider">Surveillance Alerts</span>
                    <button 
                      onClick={() => setNotifOpen(false)}
                      className="p-0.5 rounded text-muted hover:text-white"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="max-h-72 overflow-y-auto divide-y divide-border/60">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-xs text-muted">
                        No active clinical logs.
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div key={n.id} className="p-3 text-xs hover:bg-surfaceLight/30 relative">
                          <button 
                            onClick={() => clearNotification(n.id)}
                            className="absolute top-2 right-2 text-muted hover:text-danger p-0.5"
                          >
                            <X className="w-3 h-3" />
                          </button>
                          <div className="flex items-start gap-2 pr-4">
                            <span className={`w-1.5 h-1.5 rounded-full shrink-0 mt-1.5 ${
                              n.type === 'CRITICAL' ? 'bg-danger animate-pulse' : n.type === 'WARNING' ? 'bg-warning' : 'bg-primary'
                            }`} />
                            <div>
                              <h5 className="font-bold text-white">{n.title}</h5>
                              <p className="text-slate-300 text-[11px] mt-0.5 leading-relaxed">{n.message}</p>
                              <span className="text-[10px] text-muted mt-1 block">{n.timestamp}</span>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="p-2 border-t border-border bg-surfaceLight/30 text-center text-[10px]">
                    <span className="text-muted tracking-wider uppercase font-semibold">Intelligence Logs</span>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Action Shortcuts */}
            <div className="flex items-center gap-1">
              <button 
                onClick={() => playTone(500, 'sine', 0.1, 0.05)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-surfaceLight/60"
              >
                <Settings className="w-4.5 h-4.5" />
              </button>
              <button 
                onClick={() => playTone(600, 'sine', 0.1, 0.05)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-surfaceLight/60"
              >
                <HelpCircle className="w-4.5 h-4.5" />
              </button>
            </div>
          </div>
        </header>

        {/* ACTIVE FLOATING ACTIVITY TICKER */}
        <section className="h-9 bg-surface/50 border-b border-border/80 px-6 flex items-center gap-3 overflow-hidden text-xs">
          <div className="shrink-0 flex items-center gap-1.5 text-primary font-bold tracking-widest text-[10px] uppercase glow-cyan border-r border-border pr-3">
            <Activity className="w-3.5 h-3.5 text-primary animate-pulse" />
            <span>INTELLIGENCE TICKER</span>
          </div>
          <div className="flex-1 overflow-hidden relative w-full h-full flex items-center">
            {/* Simple CSS-based scrolling ticker for continuous feedback */}
            <div className="flex gap-12 whitespace-nowrap animate-[marquee_25s_linear_infinite] hover:[animation-play-state:paused]">
              {symptomReports.slice(0, 3).map((rep) => (
                <span key={rep.id} className="flex items-center gap-2 text-slate-300 font-medium">
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${rep.severity === 'HIGH RISK' ? 'bg-danger animate-pulse' : 'bg-warning'}`} />
                  <strong className="text-white">{rep.clinical_category} ({rep.origin})</strong> Reported by {rep.reporter_name}
                </span>
              ))}
              {/* Duplicate to ensure seamless looping */}
              {symptomReports.slice(0, 3).map((rep) => (
                <span key={`dup-${rep.id}`} className="flex items-center gap-2 text-slate-300 font-medium">
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${rep.severity === 'HIGH RISK' ? 'bg-danger animate-pulse' : 'bg-warning'}`} />
                  <strong className="text-white">{rep.clinical_category} ({rep.origin})</strong> Reported by {rep.reporter_name}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* MAIN ROUTED PAGES SLOP */}
        <main className="flex-1 overflow-y-auto p-6 bg-background relative">
          {children}
        </main>
      </div>

      {/* ==========================================
          URGENT SOS OVERLAY MODAL (flashing alerts)
          ========================================== */}
      {activeSOSAlert && (
        <div className="fixed inset-0 bg-[#070b13]/85 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fadeIn">
          
          {/* Modal Container */}
          <div className="max-w-md w-full glass-card border-danger/60 shadow-[0_0_50px_rgba(255,59,48,0.25)] overflow-hidden relative border-t-4 border-t-danger animate-scaleIn">
            
            {/* Flashing Urgency Strip */}
            <div className="bg-danger/25 p-3 flex items-center gap-2 text-white border-b border-danger/30 animate-pulse">
              <AlertTriangle className="w-5 h-5 text-danger shrink-0 animate-bounce" />
              <div>
                <h3 className="text-sm font-bold tracking-wider uppercase glow-red">CRITICAL EMERGENCY DETECTED</h3>
                <p className="text-[10px] opacity-80">Immediate tactical response required.</p>
              </div>
            </div>

            {/* Content Dossier details */}
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xl font-bold text-white">{activeSOSAlert.citizen_name}</h4>
                  <span className="text-[10px] text-muted tracking-wider font-semibold uppercase">Citizen ID: {activeSOSAlert.citizen_id}</span>
                </div>
                <div className="text-right">
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-danger text-white rounded uppercase animate-pulse">
                    {activeSOSAlert.status}
                  </span>
                  <p className="text-[10px] text-muted mt-1">{activeSOSAlert.created_at}</p>
                </div>
              </div>

              {/* Geographic Coordinates grid snippet */}
              <div className="p-3 bg-surfaceLight/40 rounded-lg border border-border/80 space-y-1.5 text-xs text-slate-300">
                <div className="flex justify-between">
                  <span className="text-muted">Origin Coordinate:</span>
                  <span className="font-bold text-white">{activeSOSAlert.latitude.toFixed(4)}, {activeSOSAlert.longitude.toFixed(4)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Origin Village:</span>
                  <span className="font-bold text-primary">{activeSOSAlert.village}</span>
                </div>
              </div>

              {/* Live Vital trackers */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-surfaceLight/50 rounded-lg border border-border/60 flex items-center gap-3">
                  <Heart className="w-8 h-8 text-danger shrink-0 animate-[pulse_1s_infinite]" />
                  <div>
                    <span className="text-[9px] text-muted font-bold block uppercase tracking-wider">Heart Rate</span>
                    <strong className="text-lg font-bold text-white glow-red">{activeSOSAlert.heart_rate} BPM</strong>
                  </div>
                </div>

                <div className="p-3 bg-surfaceLight/50 rounded-lg border border-border/60 flex items-center gap-3">
                  <Thermometer className="w-8 h-8 text-warning shrink-0" />
                  <div>
                    <span className="text-[9px] text-muted font-bold block uppercase tracking-wider">Body Temp</span>
                    <strong className="text-lg font-bold text-white">{activeSOSAlert.temperature} °C</strong>
                  </div>
                </div>
              </div>

              {/* Dispatch ETA parameters */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                  Assigned Dispatch Unit ETA (Minutes)
                </label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={etaValue}
                    onChange={(e) => setEtaValue(e.target.value)}
                    className="flex-1 px-3 py-1.5 bg-surfaceLight border border-border rounded text-xs text-white focus:outline-none focus:border-primary"
                    placeholder="e.g. 04:12"
                  />
                  <button 
                    onClick={() => handleEtaDispatch(activeSOSAlert.id)}
                    className="px-4 bg-danger text-white rounded font-bold hover:bg-danger-hover transition text-xs shadow-md shadow-danger/20"
                  >
                    Authorize Dispatch
                  </button>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="px-6 py-4 bg-[#0c1425] border-t border-border flex items-center justify-between gap-3">
              <button 
                onClick={() => handleDismissAlert(activeSOSAlert.id)}
                className="flex-1 py-2 text-center text-xs font-semibold bg-surfaceLight hover:bg-surface border border-border text-slate-300 rounded hover:text-white transition duration-150"
              >
                Acknowledge / Mute
              </button>
              <button 
                onClick={() => {
                  resolveSOS(activeSOSAlert.id, currentUser.name)
                  setActiveSOSAlert(null)
                }}
                className="flex-1 py-2 text-center text-xs font-bold bg-success text-white hover:bg-success-hover rounded transition duration-150 shadow-sm shadow-success/15"
              >
                Force Resolve Alert
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Styled ticker movement animations */}
      <style jsx font-family="sans-serif">{`
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `}</style>

    </div>
  )
}
