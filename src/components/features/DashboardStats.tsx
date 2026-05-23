'use client'

import React from 'react'
import { FileText, AlertTriangle, AlertOctagon, Radio, TrendingUp, ShieldAlert } from 'lucide-react'
import { useSentinelStore } from '@/lib/store'

export default function DashboardStats() {
  const symptomReports = useSentinelStore((state) => state.symptomReports)
  const sosRequests = useSentinelStore((state) => state.sosRequests)

  // Calculate dynamic stats from our real-time Zustand database
  const totalReportsCount = symptomReports.length
  const activeAlertsCount = symptomReports.filter(r => r.severity === 'HIGH RISK').length
  const pendingSOSCount = sosRequests.filter(s => s.status === 'PENDING').length

  const stats = [
    {
      title: 'TOTAL REPORTS',
      value: totalReportsCount.toLocaleString(),
      badgeText: '+12.4%',
      badgeType: 'success',
      icon: FileText,
      description: 'Population signal ledger',
      glowColor: 'group-hover:border-primary/45'
    },
    {
      title: 'ACTIVE ALERTS',
      value: activeAlertsCount,
      badgeText: 'Critical Spike',
      badgeType: 'danger',
      icon: ShieldAlert,
      description: 'High-severity clusters',
      glowColor: 'group-hover:border-danger/45'
    },
    {
      title: 'SOS REQUESTS',
      value: pendingSOSCount,
      badgeText: `${pendingSOSCount} Pending`,
      badgeType: pendingSOSCount > 0 ? 'alert' : 'muted',
      icon: AlertOctagon,
      description: 'Emergency response queue',
      glowColor: 'group-hover:border-warning/45'
    },
    {
      title: 'NETWORK COVERAGE',
      value: '98.2%',
      badgeText: 'Active',
      badgeType: 'success',
      icon: Radio,
      description: 'PHC diagnostic reach',
      glowColor: 'group-hover:border-primary/45'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
      {stats.map((stat, idx) => {
        const Icon = stat.icon
        
        return (
          <div 
            key={idx} 
            className="group glass-card p-5 shadow-lg bg-surface/50 border border-border/80 rounded-xl transition-all duration-300 hover:translate-y-[-2px] hover:border-border hover:shadow-[0_8px_30px_rgba(0,0,0,0.5)] cursor-pointer"
          >
            <div className="flex justify-between items-start mb-3">
              <div className="p-2.5 bg-surfaceLight/60 rounded-lg border border-border group-hover:border-primary/20 transition duration-300">
                <Icon className={`w-5 h-5 ${
                  stat.badgeType === 'danger' ? 'text-danger' : 
                  stat.badgeType === 'alert' ? 'text-warning animate-pulse' : 
                  'text-primary'
                }`} />
              </div>

              {/* Dynamic Badge */}
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                stat.badgeType === 'success' ? 'bg-success/15 text-success border border-success/30' :
                stat.badgeType === 'danger' ? 'bg-danger/15 text-danger border border-danger/35 animate-pulse' :
                stat.badgeType === 'alert' ? 'bg-warning text-background font-extrabold border border-warning/35 animate-pulse' :
                'bg-slate-800 text-slate-400 border border-slate-700'
              }`}>
                {stat.badgeText}
              </span>
            </div>

            <div>
              <span className="text-[10px] font-bold text-muted uppercase tracking-widest block">
                {stat.title}
              </span>
              <strong className="text-3xl font-extrabold text-white tracking-tight mt-1 block">
                {stat.value}
              </strong>
              
              {/* Context info or Network coverage bar */}
              {stat.title === 'NETWORK COVERAGE' ? (
                <div className="mt-3.5 space-y-1.5">
                  <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-cyan-500 to-primary w-[98.2%] rounded-full" />
                  </div>
                  <p className="text-[10px] text-muted font-medium">12 active surveillance sectors</p>
                </div>
              ) : (
                <p className="text-[10.5px] text-muted mt-2 font-medium">
                  {stat.description}
                </p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
