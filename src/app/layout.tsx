'use client'

import './globals.css'
import React, { useEffect } from 'react'
import { useSentinelStore } from '@/lib/store'
import { useRealtimeSubscription } from '@/hooks/useRealtimeSubscription'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const tickSimulator = useSentinelStore((state) => state.tickSimulator)
  const simulationActive = useSentinelStore((state) => state.simulationActive)

  // Initialize live Supabase realtime subscriptions
  useRealtimeSubscription()

  // Background Simulator Engine: Runs a tick every 35 seconds to feed reports & emergencies
  useEffect(() => {
    if (!simulationActive) return

    // Run first simulation tick after 10s to let dashboard load beautifully
    const initialDelay = setTimeout(() => {
      tickSimulator()
    }, 10000)

    const interval = setInterval(() => {
      tickSimulator()
    }, 35000)

    return () => {
      clearTimeout(initialDelay)
      clearInterval(interval)
    }
  }, [simulationActive, tickSimulator])

  return (
    <html lang="en">
      <head>
        <title>Sentinel - Clinical Intelligence Dashboard</title>
        <meta name="description" content="Production-grade epidemiological surveillance and emergency response monitoring console for Chief Health Officers." />
        <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🛡️</text></svg>" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Outfit:wght@400;500;600;700&display=swap" rel="stylesheet" />
        {/* Leaflet CSS required for client mapping */}
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin=""
        />
      </head>
      <body className="antialiased min-h-screen bg-background text-slate-100 font-sans selection:bg-cyan-500/20 selection:text-primary">
        {children}
      </body>
    </html>
  )
}
