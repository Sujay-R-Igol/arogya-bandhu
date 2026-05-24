'use client'

import React, { useState, useMemo } from 'react'
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
  ShieldAlert,
  ChevronDown,
  Calendar,
  ActivitySquare
} from 'lucide-react'
import { useSentinelStore } from '@/lib/store'
import { playTone, playSuccessArpeggio, playWarningGong } from '@/lib/audio'
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from 'recharts'

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
  const [showManualForm, setShowManualForm] = useState(false)
  const [newCat, setNewCat] = useState('Acute Respiratory')
  const [newOrigin, setNewOrigin] = useState('Bhogadi')
  const [newSev, setNewSev] = useState<'LOW RISK' | 'MODERATE' | 'HIGH RISK'>('HIGH RISK')
  const [newReporter, setNewReporter] = useState('CHO Manual Signal')
  const [newDetails, setNewDetails] = useState('')

  // Filtered reports calculation
  const filteredReports = symptomReports.filter((report) => {
    const textQuery = searchQuery.toLowerCase().trim()
    const matchesQuery = 
      !textQuery ||
      String(report.id).toLowerCase().includes(textQuery) ||
      String(report.clinical_category).toLowerCase().includes(textQuery) ||
      String(report.origin).toLowerCase().includes(textQuery) ||
      String(report.reporter_name).toLowerCase().includes(textQuery)

    const matchesVillage = !filters.village || report.origin === filters.village
    const matchesSeverity = !filters.symptom || report.severity === filters.symptom

    return matchesQuery && matchesVillage && matchesSeverity
  })

  // Export CSV function
  const handleExportCSV = () => {
    playTone(900, 'sine', 0.1, 0.05)
    
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
    link.setAttribute("download", `phc_surveillance_export_${new Date().toISOString().split('T')[0]}.csv`)
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
      latitude: 12.3345,
      longitude: 76.6025,
      reporter_name: newReporter,
      details: newDetails || 'Manual clinical signal input by Chief Health Officer from Primary Health Centre (PHC).'
    })
    setShowManualForm(false)
    setNewDetails('')
  }

  // Derived Analytics (Memoized)
  const { 
    activeHighRiskCount, 
    mostAffectedWard, 
    dominantDisease, 
    lastReportTime, 
    wardSurveillance, 
    trendData 
  } = useMemo(() => {
    const activeHighRisk = symptomReports.filter(r => r.severity === 'HIGH RISK' && r.status !== 'RESOLVED');
    
    const wardCounts: Record<string, number> = {};
    const diseaseCounts: Record<string, number> = {};
    
    activeHighRisk.forEach(r => {
      wardCounts[r.origin] = (wardCounts[r.origin] || 0) + 1;
      diseaseCounts[r.clinical_category] = (diseaseCounts[r.clinical_category] || 0) + 1;
    });

    const mostAffWard = Object.keys(wardCounts).sort((a, b) => wardCounts[b] - wardCounts[a])[0] || 'None';
    const domDis = Object.keys(diseaseCounts).sort((a, b) => diseaseCounts[b] - diseaseCounts[a])[0] || 'None';
    const lastReport = symptomReports[0]?.timestamp || 'N/A';

    // Ward Surveillance Aggregation
    const wardAggr: Record<string, { count: number; diseases: Record<string, number>; worstSeverity: string; lastUpdated: string }> = {};
    symptomReports.forEach(r => {
      if (!wardAggr[r.origin]) {
        wardAggr[r.origin] = { count: 0, diseases: {}, worstSeverity: 'LOW RISK', lastUpdated: r.timestamp };
      }
      wardAggr[r.origin].count++;
      wardAggr[r.origin].diseases[r.clinical_category] = (wardAggr[r.origin].diseases[r.clinical_category] || 0) + 1;
      
      if (r.severity === 'HIGH RISK') wardAggr[r.origin].worstSeverity = 'HIGH RISK';
      else if (r.severity === 'MODERATE' && wardAggr[r.origin].worstSeverity === 'LOW RISK') {
        wardAggr[r.origin].worstSeverity = 'MODERATE';
      }
    });

    const wardSurv = Object.entries(wardAggr).map(([ward, data]) => {
      const dDisease = Object.keys(data.diseases).sort((a, b) => data.diseases[b] - data.diseases[a])[0];
      return {
        ward,
        count: data.count,
        dominantDisease: dDisease,
        worstSeverity: data.worstSeverity,
        lastUpdated: data.lastUpdated
      };
    }).sort((a, b) => b.count - a.count);

    // 7-Day Trend
    const trendMap: Record<string, number> = {};
    symptomReports.forEach(r => {
      const dateStr = r.timestamp.split(',')[0] || 'Unknown';
      trendMap[dateStr] = (trendMap[dateStr] || 0) + 1;
    });
    
    const tData = Object.entries(trendMap)
      .map(([date, cases]) => ({ date, cases }))
      .reverse()
      .slice(-7);

    return {
      activeHighRiskCount: activeHighRisk.length,
      mostAffectedWard: mostAffWard,
      dominantDisease: domDis,
      lastReportTime: lastReport,
      wardSurveillance: wardSurv,
      trendData: tData
    };
  }, [symptomReports]);

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
                  <option value="Bhogadi">Bhogadi</option>
                  <option value="Hebbal">Hebbal</option>
                  <option value="Hunsur Road">Hunsur Road</option>
                  <option value="Vijay Nagar">Vijay Nagar</option>
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

      {/* ==========================================
          ACTIVE OUTBREAK SUMMARY CARD
          ========================================== */}
      {symptomReports.length > 0 ? (
        <div className={`glass-card p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-lg border-t-2 ${activeHighRiskCount > 0 ? 'bg-[#0b111e]/95 border-t-danger shadow-danger/10' : 'bg-surface/50 border-t-primary shadow-primary/5'} max-w-5xl mx-auto w-full z-10 relative rounded-xl`}>
          <div className="flex items-start gap-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-1 ${activeHighRiskCount > 0 ? 'bg-danger/10 border border-danger/25 text-danger animate-pulse' : 'bg-primary/10 border border-primary/25 text-primary'}`}>
              {activeHighRiskCount > 0 ? <AlertTriangle className="w-5 h-5" /> : <ShieldAlert className="w-5 h-5" />}
            </div>
            <div>
              <span className={`px-2 py-0.5 text-[8px] font-extrabold text-white rounded tracking-widest uppercase ${activeHighRiskCount > 0 ? 'bg-danger' : 'bg-primary'}`}>
                {activeHighRiskCount > 0 ? 'ACTIVE OUTBREAK WARNING' : 'SURVEILLANCE NORMAL'}
              </span>
              <span className="text-[10px] text-muted ml-2 font-medium">Last synced: {lastReportTime}</span>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mt-1.5">
                {activeHighRiskCount > 0 ? 'High-Risk Signals Detected' : 'No Critical Clusters Detected'}
              </h3>
              <p className="text-[11px] text-slate-300 mt-1 leading-relaxed max-w-2xl">
                {activeHighRiskCount > 0 
                  ? `${activeHighRiskCount} active high-risk report${activeHighRiskCount > 1 ? 's' : ''} detected predominantly in ${mostAffectedWard === 'None' ? 'various wards' : mostAffectedWard}. The dominant clinical category is ${dominantDisease}.`
                  : 'Symptom reports are currently within expected baseline thresholds.'
                }
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2.5 shrink-0 w-full md:w-auto">
            <button 
              onClick={() => {
                playWarningGong()
                alert('ASHA workers in the affected wards have been notified.')
              }}
              className="flex-1 md:flex-initial px-4 py-2 bg-danger text-white font-bold text-[10px] uppercase rounded hover:bg-danger-hover transition shadow-md shadow-danger/20"
            >
              Notify ASHA Workers
            </button>
            <button 
              onClick={() => alert('PHC Advisory system triggered.')}
              className="flex-1 md:flex-initial px-4 py-2 bg-slate-800 text-slate-300 font-semibold text-[10px] uppercase hover:bg-slate-700 hover:text-white rounded border border-slate-700 transition"
            >
              Issue Advisory
            </button>
            <button 
              onClick={() => alert('Ward marked for intensive monitoring.')}
              className="flex-1 md:flex-initial px-4 py-2 bg-slate-800 text-slate-300 font-semibold text-[10px] uppercase hover:bg-slate-700 hover:text-white rounded border border-slate-700 transition"
            >
              Mark Under Monitoring
            </button>
          </div>
        </div>
      ) : (
        <div className="glass-card p-6 bg-surface/50 border border-border/80 rounded-xl text-center">
          <ActivitySquare className="w-8 h-8 text-muted mx-auto mb-2 opacity-50" />
          <p className="text-sm font-bold text-white uppercase tracking-wider">No active outbreak signals detected</p>
          <p className="text-xs text-muted mt-1">The symptom database is currently clear.</p>
        </div>
      )}

      {/* ==========================================
          BOTTOM ROW DETAILS PANEL
          ========================================== */}
      {symptomReports.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
          
          {/* WARD SURVEILLANCE PANEL */}
          <div className="lg:col-span-8 glass-card bg-surface/50 border border-border/80 rounded-xl relative overflow-hidden flex flex-col h-72">
            <div className="p-4 border-b border-border/60 shrink-0">
              <h4 className="text-sm font-bold text-white uppercase tracking-wider">Ward Surveillance Summary</h4>
              <p className="text-[10px] text-muted mt-0.5">Aggregated clinical reports by location</p>
            </div>
            <div className="overflow-y-auto flex-1 p-2">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="text-slate-400 font-bold uppercase tracking-wider text-[9px] border-b border-border/40">
                    <th className="p-3 w-1/3">Ward</th>
                    <th className="p-3 text-center">Total Cases</th>
                    <th className="p-3">Dominant Disease</th>
                    <th className="p-3">Severity Status</th>
                    <th className="p-3 text-right">Last Updated</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30 text-slate-300 font-medium">
                  {wardSurveillance.map((ward, idx) => (
                    <tr key={idx} className="hover:bg-surfaceLight/30 transition">
                      <td className="p-3 font-semibold text-slate-200">{ward.ward}</td>
                      <td className="p-3 text-center font-bold text-white">{ward.count}</td>
                      <td className="p-3">{ward.dominantDisease}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold border ${
                          ward.worstSeverity === 'HIGH RISK' ? 'bg-danger/10 text-danger border-danger/25' :
                          ward.worstSeverity === 'MODERATE' ? 'bg-warning/10 text-warning border-warning/25' :
                          'bg-success/10 text-success border-success/25'
                        }`}>
                          {ward.worstSeverity}
                        </span>
                      </td>
                      <td className="p-3 text-right text-[10px] text-muted">{ward.lastUpdated}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 7-DAY REPORT TREND CHART */}
          <div className="lg:col-span-4 glass-card p-5 bg-surface/50 border border-border/80 rounded-xl flex flex-col h-72">
            <div className="shrink-0">
              <h4 className="text-sm font-bold text-white uppercase tracking-wider">7-Day Reporting Trend</h4>
              <p className="text-[10px] text-muted mt-0.5">Aggregated report volume over time</p>
            </div>
            <div className="flex-1 mt-4 w-full h-full min-h-[150px]">
              {trendData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={trendData}>
                    <XAxis 
                      dataKey="date" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#64748b', fontSize: 10 }}
                      dy={10}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '6px', color: '#f8fafc', fontSize: '11px' }}
                      itemStyle={{ color: '#3b82f6', fontWeight: 'bold' }}
                      cursor={{fill: 'rgba(255,255,255,0.02)'}}
                    />
                    <Bar dataKey="cases" name="Reports" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-muted">Not enough data to display trend</div>
              )}
            </div>
          </div>

        </div>
      )}

      {/* SEARCH AND INTERACTIVE ADVANCED FILTERS BAR */}
      {symptomReports.length > 0 && (
        <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center mt-4">
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

          <div className="flex flex-wrap gap-2 items-center">
            <select 
              value={filters.village}
              onChange={(e) => setFilters({ village: e.target.value })}
              className="px-3 py-2 bg-surface/50 border border-border/80 rounded-lg text-xs text-slate-300 focus:outline-none focus:border-primary transition"
            >
              <option value="">All Wards</option>
              {Array.from(new Set(symptomReports.map(r => r.origin))).map(ward => (
                <option key={ward} value={ward}>{ward}</option>
              ))}
            </select>

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
      )}

      {/* DYNAMIC SURVEILLANCE DATA TABLE */}
      {symptomReports.length > 0 && (
        <div className="glass-card shadow-xl overflow-hidden border border-border/85 mt-4">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#090E1A] text-slate-300 border-b border-border/80 font-bold uppercase tracking-wider text-[10px]">
                  <th className="p-4 w-28">ID</th>
                  <th className="p-4 w-40">TIMESTAMP</th>
                  <th className="p-4">CLINICAL CATEGORY</th>
                  <th className="p-4 w-48">ORIGIN WARD</th>
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

          <div className="px-4 py-3 bg-[#090E1A] border-t border-border flex items-center justify-between text-[10px] text-muted tracking-wider uppercase font-semibold">
            <span>Displaying {filteredReports.length} Active Records</span>
            <span>PHC CLINICAL REGISTRY</span>
          </div>
        </div>
      )}

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

            <div className="p-3 bg-surfaceLight/30 border border-border/60 rounded-lg text-xs space-y-1">
              <span className="text-muted block text-[10px] uppercase font-semibold mb-1">Clinical Classification</span>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-primary" />
                <span className="font-bold text-white text-sm">{selectedReport.clinical_category}</span>
              </div>
            </div>

            <div className="p-3 bg-surfaceLight/30 border border-border/60 rounded-lg text-xs space-y-1.5 text-slate-300">
              <span className="text-muted block text-[10px] uppercase font-semibold mb-1.5">Spatial Origin</span>
              <div className="flex justify-between">
                <span className="text-muted">Origin Coordinate:</span>
                <span className="font-bold text-white">{(selectedReport.latitude ?? 0).toFixed(4)}, {(selectedReport.longitude ?? 0).toFixed(4)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted flex items-center gap-1 text-[11px]"><MapPin className="w-3 h-3 text-primary" /> Ward:</span>
                <span className="font-bold text-white">{selectedReport.origin}</span>
              </div>
            </div>

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
                alert(`Escalated case ${selectedReport.id} to PHC Response team.`)
              }}
              className="flex-1 py-2 text-center text-xs font-bold bg-danger text-white rounded hover:bg-danger-hover transition"
            >
              Escalate to PHC
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
