'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Shield, Activity, Lock, Mail, AlertTriangle } from 'lucide-react'
import { useSentinelStore } from '@/lib/store'
import { loginAdmin } from '@/lib/auth'

export default function LoginPage() {
  const router = useRouter()
  const setIsAuthenticated = useSentinelStore((state) => state.setIsAuthenticated)
  const setCurrentUser = useSentinelStore((state) => state.setCurrentUser)
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { success, error: loginError } = await loginAdmin(email, password)
    
    if (success) {
      setIsAuthenticated(true)
      router.push('/admin')
    } else {
      setError(loginError || 'Authentication failed. Please check your credentials.')
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-background px-4 overflow-hidden">
      <div className="w-full max-w-md z-10">
        {/* Branding header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-surface border border-border shadow-lg shadow-black/40 mb-4">
            <Shield className="w-7 h-7 text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white font-sans">
            Bhogadi PHC
          </h1>
          <p className="text-sm text-muted mt-1 font-medium tracking-widest uppercase">
            Operations Dashboard
          </p>
        </div>

        {/* Login Panel Card (Glassmorphism) */}
        <div className="glass-card shadow-2xl shadow-black/80 overflow-hidden relative border-t-2 border-t-primary/30">
          <div className="p-6 sm:p-8">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-white">Authorized Personnel Only</h2>
              <p className="text-xs text-muted mt-0.5">
                Please sign in with your PHC administration credentials.
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
                  Official Email
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
                    placeholder="admin@bhogadiphc.in"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Password
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
                      <span>Secure Login</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Card footer details */}
          <div className="px-6 py-4 bg-surfaceLight/30 border-t border-border flex items-center justify-between text-[10px] text-muted tracking-wider">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-success" />
              SYSTEM SECURE
            </span>
            <span>PHC V1.0.4 - OPERATIONS</span>
          </div>
        </div>
      </div>
    </div>
  )
}
