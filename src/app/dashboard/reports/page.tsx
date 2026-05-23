'use client'

import React, { useState } from 'react'
import { 
  Plus, 
  Search, 
  SlidersHorizontal, 
  Download, 
  Eye, 
  MoreHorizontal, 
  X,
  AlertTriangle,
  MapPin,
  Clock,
  User,
  Activity,
  FileText,
  ChevronDown,
  Calendar
} from 'lucide-react'
import { useSentinelStore } from '@/lib/store'
import { playTone, playSuccessArpeggio, playWarningGong } from '@/lib/audio'

export default function SymptomDatabase() {
  const symptomReports = useSentinelStore((state) => state.symptomReports)
  const triggerSymptomReport = useSentinelStore((state) => state.triggerSymptomReport)
  const filters = useSentinelStore((state) => state.filters)
  const setFilters = useSentinelStore((state) => state.setFilters)
  const clearFilters = useSentinelStore((state) => state.clearFilters)
  const searchQuery = useSentinelStore((state) => state.searchQuery)
  const setSearchQuery = useSentinelStore((state) => state.setSearchQuery)

  // Local state controls
  const [selectedReport, setSelectedReport] = useState<any>(null)
  const [alertActive, setAlertActive] = useState(true) // Triggers the overlay "Cluster Detected" banner from screenshot 1
  const [showManualForm, setShowManualForm] = useState(false)
  const [newCat, setNewCat] = useState('Acute Respiratory')
  const [newOrigin, setNewOrigin] = useState('Al-Zahra West')
  const [newSev, setNewSev] = useState<'LOW RISK' | 'MODERATE' | 'HIGH RISK'>('HIGH RISK')
  const [newReporter, setNewReporter] = useState('CHO Manual Signal')
  const [newDetails, setNewDetails] = useState('')

  // Filtered reports calculation
  const filteredReports = symptomReports.filter((report) => {
    // 1. Search text match
    const textQuery = searchQuery.toLowerCase().trim()
    const matchesQuery = 
      !textQuery ||
      report.id.toLowerCase().includes(textQuery) ||
      report.clinical_category.toLowerCase().includes(textQuery) ||
      report.origin.toLowerCase().includes(textQuery) ||
      report.reporter_name.toLowerCase().includes(textQuery)

    // 2. Village filter
    const matchesVillage = !filters.village || report.origin === filters.village

    // 3. Severity filter
    const matchesSeverity = !filters.symptom || report.severity === filters.symptom // Using filters.symptom mapping for simplicity

    return matchesQuery && matchesVillage && matchesSeverity
  })

  // Export CSV function: Converts reports to a download file locally
  const handleExportCSV = () => {
    playTone(900, 'sine', 0.1, 0.05)
    
    // CSV Header definition
    const headers = ['ID', 'Timestamp', 'Clinical Category', 'Origin Village', 'Severity', 'Symptoms', 'Reporter', 'Details']
    const rows = filteredReports.map(r => [
      r.id,
      r.timestamp,
      r.clinical_category,
      r.origin,
      r.severity,
      r.symptoms.join('; '),
      r.reporter_name,
      r.details
    ])

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.map(val => `"${val.replace(/"/g, '""')}"`).join(','))].join('\n')
    
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `sentinel_surveillance_export_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    playSuccessArpeggio()
  }

  // Trigger manual signal injection
  const handleManualSignal = (e: React.FormEvent) => {
    e.preventDefault()
    triggerSymptomReport({
      clinical_category: newCat,
      origin: newOrigin,
      severity: newSev,
      symptoms: ['Fever', 'Chills', 'Cough'],
      latitude: 32.412,
      longitude: 35.123,
      reporter_name: newReporter,
      details: newDetails || 'Manual clinical signal input by Chief Health Officer from Primary Health Centre (PHC).'
    })
    setShowManualForm(false)
    setNewDetails('')
  }

  return (
    <div className="space-y-6 relative min-h-[calc(100vh-10rem)]">

      {/* TOP HEADINGS SECTION */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white font-sans">
            Symptom Database
          </h1>
          <p className="text-xs text-muted mt-0.5">
            Population health intelligence and clinical signal ledger.
          </p>
        </div>

        {/* Action button options */}
        <div className="flex gap-2">
          <button 
            onClick={() => handleExportCSV()}
            className="flex items-center gap-2 px-3 py-2 bg-surfaceLight/50 border border-border rounded-lg text-xs font-semibold hover:bg-surfaceLight hover:text-white transition duration-150"
          >
            <Download className="w-3.5 h-3.5 text-muted" />
            <span>Export CSV</span>
          </button>
          
          <button 
            onClick={() => {
              playTone(600, 'sine', 0.1, 0.05)
              setShowManualForm(!showManualForm)
            }}
            className="flex items-center gap-1.5 px-4 py-2 bg-primary text-background font-bold text-xs rounded-lg hover:bg-primary-hover active:scale-95 shadow-md shadow-primary/10 transition"
          >
            <Plus className="w-4 h-4 shrink-0" />
            <span>Manual Signal</span>
          </button>
        </div>
      </div>

      {/* MANUAL INJECTION DRAWER MODAL */}
      {showManualForm && (
        <div className="p-5 glass-card bg-surface/80 border border-primary/30 rounded-xl max-w-lg mx-auto shadow-2xl relative animate-scaleIn z-10">
          <button 
            onClick={() => setShowManualForm(false)} 
            className="absolute top-4 right-4 p-1 text-muted hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
          
          <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-primary animate-pulse" />
            Inject Clinical Signal
          </h3>

          <form onSubmit={handleManualSignal} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-bold mb-1.5 uppercase">Clinical Category</label>
                <select 
                  value={newCat} 
                  onChange={(e) => setNewCat(e.target.value)}
                  className="w-full p-2 bg-surfaceLight border border-border rounded text-white focus:outline-none"
                >
                  <option value="Acute Respiratory">Acute Respiratory</option>
                  <option value="Dermal Rash">Dermal Rash</option>
                  <option value="Gastrointestinal">Gastrointestinal</option>
                  <option value="Persistent Fever">Persistent Fever</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1.5 uppercase">Origin Village</label>
                <select 
                  value={newOrigin} 
                  onChange={(e) => setNewOrigin(e.target.value)}
                  className="w-full p-2 bg-surfaceLight border border-border rounded text-white focus:outline-none"
                >
                  <option value="Al-Zahra West">Al-Zahra West</option>
                  <option value="North Ridge">North Ridge</option>
                  <option value="Lower Delta">Lower Delta</option>
                  <option value="Grand Pine Estates">Grand Pine Estates</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-bold mb-1.5 uppercase">Severity Level</label>
                <select 
                  value={newSev} 
                  onChange={(e) => setNewSev(e.target.value as any)}
                  className="w-full p-2 bg-surfaceLight border border-border rounded text-white focus:outline-none font-bold"
                >
                  <option value="LOW RISK">LOW RISK</option>
                  <option value="MODERATE">MODERATE</option>
                  <option value="HIGH RISK">HIGH RISK</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1.5 uppercase">Reporter Signature</label>
                <input 
                  type="text" 
                  value={newReporter}
                  onChange={(e) => setNewReporter(e.target.value)}
                  className="w-full p-2 bg-surfaceLight border border-border rounded text-white focus:outline-none"
                  placeholder="e.g. ASHA Worker Lakshmi"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1.5 uppercase">Clinical Observations</label>
              <textarea 
                value={newDetails}
                onChange={(e) => setNewDetails(e.target.value)}
                className="w-full p-2 bg-surfaceLight border border-border rounded text-white focus:outline-none h-20"
                placeholder="Observed clusters of symptoms or anomalies..."
              />
            </div>

            <button 
              type="submit" 
              className="w-full py-2.5 bg-primary text-background font-bold uppercase rounded hover:bg-primary-hover transition duration-150"
            >
              Push Signal Ledger
            </button>
          </form>
        </div>
      )}

      {/* SEARCH AND INTERACTIVE ADVANCED FILTERS BAR */}
      <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center">
        
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 inset-y-0 my-auto w-4.5 h-4.5 text-muted" />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search clinical ledger, report IDs, reporters..." 
            className="w-full pl-10 pr-4 py-2 bg-surface/50 border border-border/80 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-primary/80 transition duration-150"
          />
        </div>

        {/* Filter tags controls */}
        <div className="flex flex-wrap gap-2 items-center">
          
          {/* Village Filter dropdown */}
          <select 
            value={filters.village}
            onChange={(e) => setFilters({ village: e.target.value })}
            className="px-3 py-2 bg-surface/50 border border-border/80 rounded-lg text-xs text-slate-300 focus:outline-none focus:border-primary transition"
          >
            <option value="">All Villages</option>
            <option value="Al-Zahra West">Al-Zahra West</option>
            <option value="North Ridge">North Ridge</option>
            <option value="Lower Delta">Lower Delta</option>
            <option value="Valley View North">Valley View North</option>
            <option value="Grand Pine Estates">Grand Pine Estates</option>
          </select>

          {/* Severity filter (mapped to dynamic symptom category list) */}
          <select 
            value={filters.symptom}
            onChange={(e) => setFilters({ symptom: e.target.value })}
            className="px-3 py-2 bg-surface/50 border border-border/80 rounded-lg text-xs text-slate-300 focus:outline-none focus:border-primary transition"
          >
            <option value="">All Severities</option>
            <option value="HIGH RISK">HIGH RISK</option>
            <option value="MODERATE">MODERATE</option>
            <option value="LOW RISK">LOW RISK</option>
          </select>

          {/* Date range filter mock */}
          <div className="px-3 py-2 bg-surface/50 border border-border/80 rounded-lg text-xs text-slate-300 flex items-center gap-1.5 cursor-pointer">
            <SlidersHorizontal className="w-3.5 h-3.5 text-muted" />
            <span>Last 7 Days</span>
          </div>

          {/* Clear filters badge */}
          {(filters.village || filters.symptom || searchQuery) && (
            <button 
              onClick={clearFilters}
              className="text-[10px] text-primary hover:text-white uppercase font-bold tracking-wider hover:underline"
            >
              Clear All
            </button>
          )}

        </div>

      </div>

      {/* DYNAMIC SURVEILLANCE DATA TABLE */}
      <div className="glass-card shadow-xl overflow-hidden border border-border/85">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#090E1A] text-slate-300 border-b border-border/80 font-bold uppercase tracking-wider text-[10px]">
                <th className="p-4 w-28">ID</th>
                <th className="p-4 w-40">TIMESTAMP</th>
                <th className="p-4">CLINICAL CATEGORY</th>
                <th className="p-4 w-48">ORIGIN VILLAGE</th>
                <th className="p-4 w-36">SEVERITY</th>
                <th className="p-4 w-20 text-center">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60 text-slate-300 font-medium">
              {filteredReports.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-muted font-normal">
                    No clinical reports found matching current diagnostic filters.
                  </td>
                </tr>
              ) : (
                filteredReports.map((report) => (
                  <tr key={report.id} className="hover:bg-surfaceLight/25 transition duration-150">
                    <td className="p-4 font-bold text-white tracking-widest">{report.id}</td>
                    <td className="p-4 flex items-center gap-1 text-slate-400">
                      <Clock className="w-3.5 h-3.5 shrink-0 text-muted" />
                      <span>{report.timestamp}</span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full shrink-0 ${
                          report.severity === 'HIGH RISK' ? 'bg-danger animate-pulse' : 
                          report.severity === 'MODERATE' ? 'bg-warning' : 
                          'bg-success'
                        }`} />
                        <span className="font-bold text-white">{report.clinical_category}</span>
                      </div>
                    </td>
                    <td className="p-4 font-semibold text-slate-200">{report.origin}</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold border ${
                        report.severity === 'HIGH RISK' ? 'bg-danger/10 text-danger border-danger/25' :
                        report.severity === 'MODERATE' ? 'bg-warning/10 text-warning border-warning/25' :
                        'bg-success/10 text-success border-success/25'
                      }`}>
                        {report.severity}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button 
                          onClick={() => {
                            playTone(750, 'sine', 0.1, 0.05)
                            setSelectedReport(report)
                          }}
                          title="Inspect signal detail"
                          className="p-1.5 rounded bg-surfaceLight/60 border border-border/80 text-muted hover:text-white transition duration-100"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button className="p-1.5 rounded bg-surfaceLight/60 border border-border/80 text-muted hover:text-white">
                          <MoreHorizontal className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Paginated count bar */}
        <div className="px-4 py-3 bg-[#090E1A] border-t border-border flex items-center justify-between text-[10px] text-muted tracking-wider uppercase font-semibold">
          <span>Displaying {filteredReports.length} Active Records</span>
          <span>PHC CLINICAL REGISTRY</span>
        </div>
      </div>

      {/* ==========================================
          OVERLAP INTERACTIVE ALERT CARD (SCREENSHOT 1)
          ========================================== */}
      {alertActive && (
        <div className="glass-card bg-[#0b111e]/95 border-danger/60 p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-[0_4px_30px_rgba(255,59,48,0.15)] animate-border-glow border-t-2 border-t-danger max-w-5xl mx-auto z-10 relative">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-danger/10 border border-danger/25 flex items-center justify-center shrink-0 mt-1 animate-pulse">
              <AlertTriangle className="w-5 h-5 text-danger" />
            </div>
            <div>
              <span className="px-2 py-0.5 text-[8px] font-extrabold bg-danger text-white rounded tracking-widest uppercase animate-pulse">
                HIGH SEVERITY ALERT
              </span>
              <span className="text-[10px] text-muted ml-2 font-medium">Reported 12m ago</span>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mt-1.5">
                Cluster Detected: Al-Zahra West Corridor
              </h3>
              <p className="text-[11px] text-slate-300 mt-1 leading-relaxed max-w-2xl">
                Abnormal density of Acute Respiratory signals detected within a 500m radius. Predictive models indicate high velocity of spatial spread. Immediate field unit deployment recommended to secure origin coordinates.
              </p>
            </div>
          </div>

          <div className="flex gap-2.5 shrink-0 w-full md:w-auto">
            <button 
              onClick={() => {
                playWarningGong()
                alert('Ambulances & mobile health workers deployed coordinates Al-Zahra West!')
                setAlertActive(false)
              }}
              className="flex-1 md:flex-initial px-5 py-2.5 bg-danger text-white font-bold text-xs uppercase rounded hover:bg-danger-hover transition shadow-md shadow-danger/20"
            >
              Deploy Field Units
            </button>
            <button 
              onClick={() => setAlertActive(false)}
              className="flex-1 md:flex-initial px-4 py-2.5 bg-slate-800 text-slate-300 font-semibold text-xs uppercase hover:bg-slate-700 hover:text-white rounded border border-slate-700 transition"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* ==========================================
          BOTTOM ROW DETAILS PANEL (SCREENSHOT 1)
          ========================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
        
        {/* SPATIAL SIGNAL DENSITY */}
        <div className="lg:col-span-8 glass-card p-5 bg-surface/50 border border-border/80 rounded-xl relative overflow-hidden flex flex-col md:flex-row items-center gap-6">
          {/* Grayscale map clip background mock style */}
          <div className="w-full md:w-44 h-28 shrink-0 bg-slate-900 border border-border rounded-lg relative overflow-hidden flex items-center justify-center text-[10px] uppercase font-bold text-slate-600 tracking-wider">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#1b2640_1px,transparent_1px),linear-gradient(to_bottom,#1b2640_1px,transparent_1px)] bg-[size:1.5rem_1.5rem]" />
            <div className="absolute w-8 h-8 rounded-full border border-danger/40 bg-danger/10 animate-ping" />
            <MapPin className="w-5 h-5 text-danger relative z-10" />
            <span className="absolute bottom-2 text-[9px] text-muted">Sector-4 Al-Zahra</span>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Spatial Signal Density Analysis</h4>
            <p className="text-[11.5px] text-slate-300 leading-relaxed">
              Real-time spatial mapping indicates a localized upward anomaly trend in Al-Zahra West. Clinical expansion algorithms suggest a <strong className="text-primary font-bold">24% probability</strong> of cluster expansion within the next epidemiological cycle (72 hours).
            </p>
            
            {/* Health team reviews */}
            <div className="flex items-center gap-2 pt-2 text-[10.5px] text-muted font-medium">
              <div className="flex -space-x-2">
                <img className="w-5.5 h-5.5 rounded-full border border-[#0B111E]" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=50" alt="" />
                <img className="w-5.5 h-5.5 rounded-full border border-[#0B111E]" src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=50" alt="" />
              </div>
              <span>Field units (+4 staff) are actively surveying coordinates.</span>
            </div>
          </div>
        </div>

        {/* PEAK ACTIVITY BAR CHART */}
        <div className="lg:col-span-4 glass-card p-5 bg-surface/50 border border-border/80 rounded-xl flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Peak Active Temporal Cycle</h4>
            <p className="text-[10px] text-muted mt-0.5">Symptom submission load by hour</p>
          </div>

          {/* Simple custom styled bars representing loading chart */}
          <div className="flex items-end justify-between gap-1.5 h-24 pt-4 px-2">
            <div className="flex flex-col items-center flex-1 gap-1">
              <div className="w-full h-8 bg-slate-800 rounded-sm hover:bg-primary transition" />
            </div>
            <div className="flex flex-col items-center flex-1 gap-1">
              <div className="w-full h-12 bg-slate-800 rounded-sm hover:bg-primary transition" />
            </div>
            <div className="flex flex-col items-center flex-1 gap-1">
              <div className="w-full h-16 bg-slate-800 rounded-sm hover:bg-primary transition" />
            </div>
            <div className="flex flex-col items-center flex-1 gap-1">
              <div className="w-full h-24 bg-primary rounded-sm shadow-md shadow-primary/20" />
            </div>
            <div className="flex flex-col items-center flex-1 gap-1">
              <div className="w-full h-14 bg-slate-800 rounded-sm hover:bg-primary transition" />
            </div>
            <div className="flex flex-col items-center flex-1 gap-1">
              <div className="w-full h-9 bg-slate-800 rounded-sm hover:bg-primary transition" />
            </div>
          </div>

          <div className="flex justify-between items-center text-[9px] text-muted font-bold tracking-wider mt-2 border-t border-border/40 pt-1.5">
            <span>12:00 AM</span>
            <span className="text-primary font-extrabold">PEAK ACTIVITY</span>
            <span>11:59 PM</span>
          </div>
        </div>

      </div>

      {/* ==========================================
          DETAILS INSPECTION EXPANDABLE DRAWER PANEL
          ========================================== */}
      {selectedReport && (
        <div className="fixed inset-y-0 right-0 w-96 bg-[#090E1A]/95 border-l border-border backdrop-blur-md shadow-2xl z-40 p-6 flex flex-col justify-between animate-slideLeft">
          
          <div className="space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] text-primary tracking-widest font-bold block uppercase glow-cyan">DIAGNOSTIC REPORT</span>
                <h3 className="text-xl font-bold text-white mt-1 tracking-wider">{selectedReport.id}</h3>
              </div>
              <button 
                onClick={() => setSelectedReport(null)}
                className="p-1 rounded text-muted hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Time / Severity grid details */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-surfaceLight/30 border border-border/60 rounded-lg">
                <span className="text-muted block text-[10px] uppercase font-semibold">Timestamp</span>
                <strong className="text-white mt-1 block flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-muted" />
                  {selectedReport.timestamp}
                </strong>
              </div>
              
              <div className="p-3 bg-surfaceLight/30 border border-border/60 rounded-lg">
                <span className="text-muted block text-[10px] uppercase font-semibold">Severity</span>
                <strong className={`mt-1 block uppercase ${
                  selectedReport.severity === 'HIGH RISK' ? 'text-danger' : 
                  selectedReport.severity === 'MODERATE' ? 'text-warning' : 
                  'text-success'
                }`}>
                  {selectedReport.severity}
                </strong>
              </div>
            </div>

            {/* Diagnostic Categories */}
            <div className="p-3 bg-surfaceLight/30 border border-border/60 rounded-lg text-xs space-y-1">
              <span className="text-muted block text-[10px] uppercase font-semibold mb-1">Clinical Classification</span>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-primary" />
                <span className="font-bold text-white text-sm">{selectedReport.clinical_category}</span>
              </div>
            </div>

            {/* Geographic Coordinates grid details */}
            <div className="p-3 bg-surfaceLight/30 border border-border/60 rounded-lg text-xs space-y-1.5 text-slate-300">
              <span className="text-muted block text-[10px] uppercase font-semibold mb-1.5">Spatial Origin</span>
              <div className="flex justify-between">
                <span className="text-muted">Origin Coordinate:</span>
                <span className="font-bold text-white">{selectedReport.latitude.toFixed(4)}, {selectedReport.longitude.toFixed(4)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted flex items-center gap-1 text-[11px]"><MapPin className="w-3 h-3 text-primary" /> Village:</span>
                <span className="font-bold text-white">{selectedReport.origin}</span>
              </div>
            </div>

            {/* Symptoms Tags */}
            <div className="space-y-1.5">
              <span className="text-muted block text-[10px] uppercase font-semibold">Symptom Signature</span>
              <div className="flex flex-wrap gap-1.5">
                {selectedReport.symptoms.map((sym: string, i: number) => (
                  <span key={i} className="px-2 py-0.5 rounded bg-surfaceLight text-slate-300 text-[10.5px] border border-border/80">
                    {sym}
                  </span>
                ))}
              </div>
            </div>

            {/* Observation field notes */}
            <div className="p-3 bg-surfaceLight/20 border border-border/40 rounded-lg text-xs space-y-1 text-slate-300 leading-relaxed">
              <span className="text-muted block text-[10px] uppercase font-semibold flex items-center gap-1 mb-1">
                <User className="w-3 h-3 text-primary" /> Field Observations ({selectedReport.reporter_name})
              </span>
              <p>{selectedReport.details}</p>
            </div>

          </div>

          <div className="pt-4 border-t border-border flex gap-3">
            <button 
              onClick={() => {
                playWarningGong()
                alert(`Ambulance & surveillance team sent coordinate ${selectedReport.origin}`)
              }}
              className="flex-1 py-2 text-center text-xs font-bold bg-danger text-white rounded hover:bg-danger-hover transition"
            >
              Deploy Field Unit
            </button>
            <button 
              onClick={() => setSelectedReport(null)}
              className="flex-1 py-2 text-center text-xs font-semibold bg-surfaceLight text-slate-300 rounded hover:text-white transition"
            >
              Close Dossier
            </button>
          </div>

        </div>
      )}

      {/* Styled slide left drawer animations */}
      <style jsx font-family="sans-serif">{`
        @keyframes slideLeft {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        @keyframes scaleIn {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `}</style>

    </div>
  )
}
