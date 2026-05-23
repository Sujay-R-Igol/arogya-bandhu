'use client'

import React, { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, CircleMarker, useMap } from 'react-leaflet'
import L from 'leaflet'
import { useSentinelStore } from '@/lib/store'
import { playTone } from '@/lib/audio'

// Center coordinates around our village sector cluster
const centerLat = 32.4120
const centerLng = 35.1230

// Helper component to handle flying/panning to coordinates dynamically
function ChangeMapView({ coords }: { coords: [number, number] }) {
  const map = useMap()
  useEffect(() => {
    map.setView(coords, map.getZoom())
  }, [coords, map])
  return null
}

export default function LiveMapComponent({
  focusedCoords
}: {
  focusedCoords?: [number, number] | null
}) {
  const symptomReports = useSentinelStore((state) => state.symptomReports)
  const sosRequests = useSentinelStore((state) => state.sosRequests)

  // Custom DivIcon generator to create a glowing cyan diagnostic pulse
  const createReportIcon = (severity: string) => {
    const isHigh = severity === 'HIGH RISK'
    const colorClass = isHigh ? 'bg-danger shadow-danger/40' : severity === 'MODERATE' ? 'bg-warning shadow-warning/45' : 'bg-success shadow-success/40'
    
    return L.divIcon({
      className: 'custom-div-icon',
      html: `
        <div class="relative w-7 h-7 flex items-center justify-center">
          <div class="absolute inset-0 rounded-full ${colorClass} opacity-25 animate-ping"></div>
          <div class="w-3.5 h-3.5 rounded-full ${colorClass} border-2 border-[#0B111E] shadow-md relative z-10"></div>
        </div>
      `,
      iconSize: [28, 28],
      iconAnchor: [14, 14]
    })
  }

  // Custom DivIcon generator for flashing red SOS emergency hotspots
  const createSosIcon = () => {
    return L.divIcon({
      className: 'custom-div-icon-sos',
      html: `
        <div class="relative w-10 h-10 flex items-center justify-center">
          <div class="absolute inset-0 rounded-full bg-danger opacity-40 animate-[ping_1.2s_infinite]"></div>
          <div class="w-5 h-5 rounded-full bg-danger border-2 border-white flex items-center justify-center shadow-lg relative z-10">
            <span class="w-2 h-2 bg-white rounded-full animate-pulse"></span>
          </div>
        </div>
      `,
      iconSize: [40, 40],
      iconAnchor: [20, 20]
    })
  }

  return (
    <div className="w-full h-full relative rounded-xl overflow-hidden border border-border">
      
      <MapContainer
        center={[centerLat, centerLng]}
        zoom={13}
        scrollWheelZoom={true}
        className="w-full h-full"
      >
        {/* Grayscale CartoDB Dark Matter tiles matching futuristic government-tech theme */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          maxZoom={20}
        />

        {/* Change map focus dynamically if focusedCoords is supplied */}
        {focusedCoords && <ChangeMapView coords={focusedCoords} />}

        {/* 1. Map dynamic symptom reports from local Zustand / Supabase */}
        {symptomReports.map((report) => (
          <Marker
            key={report.id}
            position={[report.latitude, report.longitude]}
            icon={createReportIcon(report.severity)}
            eventHandlers={{
              click: () => playTone(550, 'sine', 0.1, 0.05)
            }}
          >
            <Popup>
              <div className="p-1 space-y-1.5 font-sans">
                <div className="flex justify-between items-center gap-2">
                  <strong className="text-white text-xs font-bold font-sans uppercase">{report.clinical_category}</strong>
                  <span className={`px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase ${
                    report.severity === 'HIGH RISK' ? 'bg-danger text-white' : 'bg-warning text-background'
                  }`}>
                    {report.severity}
                  </span>
                </div>
                <p className="text-slate-300 text-[10.5px] leading-relaxed font-sans">{report.details}</p>
                <div className="text-[9px] text-slate-400 font-bold border-t border-border pt-1 uppercase flex justify-between">
                  <span>{report.origin}</span>
                  <span>{report.timestamp}</span>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* 2. Map dynamic active SOS emergency incidents */}
        {sosRequests
          .filter((s) => s.status !== 'RESOLVED')
          .map((sos) => (
            <Marker
              key={sos.id}
              position={[sos.latitude, sos.longitude]}
              icon={createSosIcon()}
              eventHandlers={{
                click: () => playTone(650, 'sine', 0.1, 0.05)
              }}
            >
              <Popup>
                <div className="p-1 space-y-1.5 font-sans">
                  <div className="flex justify-between items-center">
                    <strong className="text-danger text-xs font-bold font-sans uppercase tracking-wider">🚨 URGENT SOS ALERT</strong>
                    <span className="px-1 bg-danger text-white text-[8px] font-bold rounded animate-pulse">{sos.status}</span>
                  </div>
                  <h4 className="text-white text-sm font-extrabold font-sans leading-none">{sos.citizen_name}</h4>
                  <p className="text-[10px] text-slate-300 leading-normal font-sans">
                    Wearable trigger alert. Critical vitals: <strong className="text-danger font-bold">{sos.heart_rate} BPM</strong>, {sos.temperature}°C.
                  </p>
                  <div className="text-[9px] text-slate-400 font-bold border-t border-border pt-1 uppercase flex justify-between">
                    <span>{sos.village}</span>
                    <span>{sos.created_at}</span>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}

        {/* 3. Heat indicators for Al-Zahra West outbreak severity (pulsing warning zones) */}
        <CircleMarker
          center={[32.4120, 35.1230]}
          pathOptions={{ fillColor: '#FF3B30', fillOpacity: 0.1, color: '#FF3B30', weight: 1, dashArray: '4, 4' }}
          radius={120}
        />
        
        <CircleMarker
          center={[32.4289, 35.1482]}
          pathOptions={{ fillColor: '#FF9500', fillOpacity: 0.06, color: '#FF9500', weight: 1, dashArray: '4, 4' }}
          radius={80}
        />

      </MapContainer>
    </div>
  )
}
