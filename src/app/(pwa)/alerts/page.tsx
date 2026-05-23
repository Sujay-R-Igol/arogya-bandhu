'use client';

import React from 'react';
import { ShieldAlert, PlayCircle, Volume2 } from 'lucide-react';
import { useAppStore } from '@/lib/stores/appStore';
import { translations } from '@/lib/i18n/translations';

export default function AlertsPage() {
  const { language } = useAppStore();
  const t = translations[language];

  return (
    <div className="px-5 py-6">
      <div className="flex items-center gap-3 mb-2">
        <h1 className="text-3xl font-bold text-white">{t.alertsTitle}</h1>
        <span className="bg-pwa-accent text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
          2 New
        </span>
      </div>
      {language === 'en' && <h2 className="text-xl font-bold text-pwa-primary mb-3">{translations.kn.alertsTitle}</h2>}
      <p className="text-sm text-pwa-muted mb-8 leading-relaxed">
        {t.stayUpdated}
      </p>

      <div className="space-y-5">
        {/* Urgent Alert Card */}
        <div className="bg-[#FFFDF7] rounded-[24px] overflow-hidden shadow-lg">
          <div className="p-5">
            <div className="flex justify-between items-center mb-3">
              <span className="text-[11px] font-bold text-pwa-accent tracking-widest uppercase">⚠ Urgent</span>
              <span className="text-[10px] text-gray-400 font-medium">10 mins ago</span>
            </div>
            
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-pwa-accent shrink-0">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-[#0B1C17] font-bold text-xl leading-tight">Dengue Outbreak Risk</h2>
                {language === 'en' && <p className="text-[#0B1C17]/60 font-medium text-sm mt-0.5">ಡೆಂಗ್ಯೂ ಹರಡುವಿಕೆಯ ಅಪಾಯ</p>}
              </div>
            </div>
            
            <p className="text-[#0B1C17]/70 text-sm bg-black/5 p-3 rounded-xl mb-5 leading-relaxed font-medium">
              High mosquito activity reported in the eastern district. Please ensure no stagnant water around your homes.
            </p>
            
            <button className="w-full py-3.5 rounded-2xl bg-pwa-accent text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-pwa-accent/20">
              <Volume2 className="w-4 h-4" />
              Play Audio Message
            </button>
          </div>
        </div>

        {/* Update Alert Card */}
        <div className="bg-[#E6F5ED] rounded-[24px] overflow-hidden shadow-lg">
          <div className="p-5">
            <div className="flex justify-between items-center mb-3">
              <span className="text-[11px] font-bold text-[#2D7A50] tracking-widest uppercase">📢 Update</span>
              <span className="text-[10px] text-[#0B1C17]/40 font-medium">2 hours ago</span>
            </div>
            
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#2D7A50] shrink-0 shadow-sm">
                <span className="text-xl">💉</span>
              </div>
              <div>
                <h2 className="text-[#0B1C17] font-bold text-xl leading-tight">Vaccination Drive</h2>
                {language === 'en' && <p className="text-[#0B1C17]/60 font-medium text-sm mt-0.5">ಲಸಿಕೆ ಅಭಿಯಾನ</p>}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="bg-[#0B1C17]/10 text-[#0B1C17]/70 text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5">
                <PlayCircle className="w-3.5 h-3.5" />
                Watch Guide · 2:15
              </span>
            </div>
          </div>
        </div>

        {/* Info Alert Card */}
        <div className="bg-pwa-surface rounded-[24px] overflow-hidden border border-pwa-border">
          <div className="p-5">
            <div className="flex justify-between items-center mb-3">
              <span className="text-[11px] font-bold text-blue-400 tracking-widest uppercase">ℹ Info</span>
              <span className="text-[10px] text-pwa-muted font-medium">Yesterday</span>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0">
                <span className="text-xl">💧</span>
              </div>
              <div>
                <h2 className="text-white font-bold text-lg leading-tight">Water Quality Update</h2>
                {language === 'en' && <p className="text-pwa-muted text-xs mt-0.5">ನೀರಿನ ಗುಣಮಟ್ಟ ನವೀಕರಣ</p>}
                <p className="text-pwa-muted text-xs mt-2 leading-relaxed">Tap water quality in Sector A has been cleared. Safe to consume after boiling.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
