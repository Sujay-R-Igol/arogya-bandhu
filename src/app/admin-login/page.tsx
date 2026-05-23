'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Shield, Activity, Lock, Mail, AlertTriangle } from 'lucide-react'
import { useSentinelStore } from '@/lib/store'

export default function LoginPage() {
  const router = useRouter()
  const setIsAuthenticated = useSentinelStore((state) => state.setIsAuthenticated)
  
  const [email, setEmail] = useState('cho@sentinel.gov')
  const [password, setPassword] = useState('sentinel2026')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Simulating immediate validation of credentials
    setTimeout(() => {
      if (email.trim() === 'cho@sentinel.gov' && password === 'sentinel2026') {
        setIsAuthenticated(true)
        router.push('/admin')
      } else {
        setError('Access Denied: Invalid clinical credentials or signature.')
        setLoading(false)
      }
    }, 800)
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-background px-4 overflow-hidden">
      {/* Dynamic Animated Ambient Glow Backgrounds */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/10 rounded-full blur-[120px] pointer-events-none animate-pulse duration-5000" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-danger/5 rounded-full blur-[120px] pointer-events-none animate-pulse duration-7000" />

      {/* Cyber Grid Pattern Backdrop */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#151D30_1px,transparent_1px),linear-gradient(to_bottom,#151D30_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-35" />

      <div className="w-full max-w-md z-10">
        {/* Branding header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-surface border border-border shadow-lg shadow-black/40 mb-4 animate-bounce duration-[4000ms]">
            <Shield className="w-7 h-7 text-primary glow-cyan" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white font-sans bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-primary">
            SENTINEL
          </h1>
          <p className="text-sm text-muted mt-1 font-medium tracking-widest uppercase">
            Clinical Intelligence Agency
          </p>
        </div>

        {/* Login Panel Card (Glassmorphism) */}
        <div className="glass-card shadow-2xl shadow-black/80 overflow-hidden relative border-t-2 border-t-primary/30">
          <div className="p-6 sm:p-8">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-white">CHO Terminal Access</h2>
              <p className="text-xs text-muted mt-0.5">
                Authorized entry for Chief Health Officers & Epidemiologists.
              </p>
            </div>

            {error && (
              <div className="mb-5 flex items-start gap-2.5 p-3 rounded-lg bg-danger/10 border border-danger/30 text-xs text-danger-hover">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Clinical Email ID
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2.5 bg-surfaceLight/50 border border-border rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary focus:bg-surfaceLight transition duration-150"
                    placeholder="cho@sentinel.gov"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Access Key Signature
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2.5 bg-surfaceLight/50 border border-border rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary focus:bg-surfaceLight transition duration-150"
                    placeholder="••••••••••••"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="relative w-full flex justify-center items-center gap-2 py-3 px-4 bg-primary text-background font-semibold text-sm rounded-lg hover:bg-primary-hover active:scale-[0.98] transition duration-150 shadow-md shadow-primary/20 disabled:opacity-50 disabled:pointer-events-none overflow-hidden"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-background border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Activity className="w-4 h-4" />
                      <span>Unlock Command Console</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Card footer details */}
          <div className="px-6 py-4 bg-surfaceLight/30 border-t border-border flex items-center justify-between text-[10px] text-muted tracking-wider">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
              SYSTEM SECURE
            </span>
            <span>PHC V1.0.4 - REALTIME CONSOLE</span>
          </div>
        </div>

        {/* Global instructions ticker / hint */}
        <p className="text-center text-xs text-muted/60 mt-6 tracking-wide">
          Developer Bypass: Email <code className="text-primary/70">cho@sentinel.gov</code> & Key <code className="text-primary/70">sentinel2026</code>
        </p>
      </div>
    </div>
  )
}
