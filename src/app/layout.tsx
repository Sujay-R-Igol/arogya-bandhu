'use client'

import './globals.css'
import React, { useEffect } from 'react'
import { useSentinelStore } from '@/lib/store'
import { useRealtimeSubscription } from '@/hooks/useRealtimeSubscription'
import { usePathname } from 'next/navigation'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const tickSimulator = useSentinelStore((state) => state.tickSimulator)
  const simulationActive = useSentinelStore((state) => state.simulationActive)

  // Initialize live Supabase realtime subscriptions
  useRealtimeSubscription()

  const pathname = usePathname()

  // Background Simulator Engine: Runs a tick every 35 seconds to feed reports & emergencies
  useEffect(() => {
    if (!simulationActive || !pathname?.startsWith('/admin')) return

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
  }, [simulationActive, tickSimulator, pathname])

  return (
    <html lang="en">
      <head>
        <title>Arogya Bandhu - Smart Health Alerts</title>
        <meta name="description" content="Production-grade epidemiological surveillance and emergency response monitoring console for Chief Health Officers." />
        <link rel="icon" href="/logo.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Outfit:wght@400;500;600;700&family=Playfair+Display:wght@600;700&display=swap" rel="stylesheet" />
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
