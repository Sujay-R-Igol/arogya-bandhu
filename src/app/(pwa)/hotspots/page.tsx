'use client';

import React from 'react';
import { AlertTriangle, ShieldAlert, PlayCircle } from 'lucide-react';
import { useAppStore } from '@/lib/stores/appStore';
import { translations } from '@/lib/i18n/translations';

export default function HotspotsPage() {
  const { language } = useAppStore();
  const t = translations[language];

  return (
    <div className="px-5 py-6">
      <h1 className="text-3xl font-bold text-white mb-1">{t.diseaseHotspots}</h1>
      {language === 'en' && <h2 className="text-xl font-bold text-pwa-primary mb-6">{translations.kn.diseaseHotspots}</h2>}

      {/* Map Placeholder */}
      <div className="w-full h-52 bg-pwa-surface rounded-2xl border border-pwa-border mb-8 relative overflow-hidden">
        {/* Grid lines for map effect */}
        <div className="absolute inset-0 opacity-10"
          style={{backgroundImage: 'linear-gradient(rgba(162,215,197,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(162,215,197,0.3) 1px, transparent 1px)', backgroundSize: '30px 30px'}}
        />
        
        {/* Pulsing hotspot 1 - main */}
        <div className="absolute top-1/2 left-[55%] -translate-x-1/2 -translate-y-1/2">
          <div className="absolute w-16 h-16 rounded-full bg-red-500/20 animate-ping -top-6 -left-6" style={{animationDuration: '2s'}} />
          <div className="absolute w-10 h-10 rounded-full bg-red-500/15 animate-ping -top-3 -left-3" style={{animationDuration: '1.5s', animationDelay: '0.3s'}} />
          <div className="w-4 h-4 rounded-full bg-red-500 shadow-[0_0_20px_rgba(239,68,68,0.9)] relative z-10" />
        </div>

        {/* Pulsing hotspot 2 - smaller */}
        <div className="absolute top-[30%] left-[25%]">
          <div className="absolute w-10 h-10 rounded-full bg-red-500/15 animate-ping -top-3 -left-3" style={{animationDuration: '2.5s'}} />
          <div className="w-2.5 h-2.5 rounded-full bg-red-400 relative z-10" />
        </div>

        {/* High Risk Zone badge */}
        <div className="absolute top-3 right-3 bg-pwa-bg/80 backdrop-blur text-[10px] text-white px-3 py-2 rounded-xl border border-pwa-border flex items-center gap-2">
          <AlertTriangle className="w-3.5 h-3.5 text-pwa-accent shrink-0" />
          <div>
            <div className="font-bold text-pwa-accent">High Risk Zone</div>
            <div className="text-pwa-muted">Dengue outbreak reported.</div>
          </div>
        </div>
      </div>

      {/* Urgent Alerts Section */}
      <h3 className="text-2xl font-bold text-white mb-1">{t.urgentAlerts}</h3>
      {language === 'en' && <h4 className="text-base font-bold text-pwa-primary mb-4">{translations.kn.urgentAlerts}</h4>}
      
      <div className="space-y-3 mb-10">
        <div className="bg-pwa-surface rounded-2xl p-4 flex gap-4 border-l-4 border-pwa-accent overflow-hidden">
          <div className="w-11 h-11 rounded-full bg-pwa-accent flex items-center justify-center text-white shrink-0">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="white"><path d="M12 2a5 5 0 1 0 5 5A5 5 0 0 0 12 2zm0 8a3 3 0 1 1 3-3 3 3 0 0 1-3 3zm9 11v-1a7 7 0 0 0-7-7h-4a7 7 0 0 0-7 7v1h2v-1a5 5 0 0 1 5-5h4a5 5 0 0 1 5 5v1z"/></svg>
          </div>
          <div>
            <h4 className="text-sm font-bold text-pwa-accent mb-0.5">Contaminated Water</h4>
            {language === 'en' && <p className="text-[11px] text-pwa-muted mb-1.5">ಕಲುಷಿತ ನೀರು</p>}
            <p className="text-xs text-white/80 leading-relaxed">
              Avoid drinking from well #4 until further notice. Boiling required.
            </p>
          </div>
        </div>

        <div className="bg-pwa-surface rounded-2xl p-4 flex gap-4 border-l-4 border-pwa-accent overflow-hidden">
          <div className="w-11 h-11 rounded-full bg-pwa-accent flex items-center justify-center text-white shrink-0">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-pwa-accent mb-0.5">Mosquito Spraying</h4>
            {language === 'en' && <p className="text-[11px] text-pwa-muted mb-1.5">ಸೊಳ್ಳೆ ಸಿಂಪಡಣೆ</p>}
            <p className="text-xs text-white/80 leading-relaxed">
              Scheduled for Sector B tonight from 8 PM to 10 PM. Keep windows closed.
            </p>
          </div>
        </div>
      </div>

      {/* How to stay safe */}
      <h3 className="text-2xl font-bold text-white mb-1">{t.howToStaySafe}</h3>
      {language === 'en' && <h4 className="text-base font-bold text-pwa-primary mb-6">ಸುರಕ್ಷಿತವಾಗಿರುವುದು ಹೇಗೆ</h4>}

      <div className="space-y-8">
        {[
          { title: 'Proper Handwashing', kn: 'ಸರಿಯಾದ ಕೈ ತೊಳೆಯುವುದು' },
          { title: 'Using Mosquito Nets', kn: 'ಸೊಳ್ಳೆ ಪರದೆಗಳನ್ನು ಬಳಸಿ' }
        ].map((item, i) => (
          <div key={i} className="flex flex-col items-center">
            <button className="w-16 h-16 rounded-full bg-pwa-surfaceLight border border-pwa-border flex items-center justify-center text-white shadow-lg mb-3">
              <PlayCircle className="w-8 h-8 fill-white/90" />
            </button>
            <h4 className="text-base font-bold text-white text-center">{item.title}</h4>
            {language === 'en' && <p className="text-sm text-pwa-muted text-center mt-0.5">{item.kn}</p>}
          </div>
        ))}
      </div>

    </div>
  );
}
