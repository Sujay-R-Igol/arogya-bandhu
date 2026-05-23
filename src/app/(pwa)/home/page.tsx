'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRight, Phone, Plus, Flame } from 'lucide-react';
import { useAppStore } from '@/lib/stores/appStore';
import { translations } from '@/lib/i18n/translations';

export default function PWAHomePage() {
  const { language } = useAppStore();
  const t = translations[language];

  return (
    <div className="px-5 py-2">
      {/* Greeting */}
      <div className="mb-8 mt-2">
        <h1 className="text-3xl font-serif font-bold text-white mb-1 tracking-wide">{t.greeting}</h1>
        {language === 'en' && <h2 className="text-3xl font-bold text-pwa-primary mb-2">{translations.kn.greeting}</h2>}
        <p className="text-sm text-pwa-muted mt-4 max-w-[250px] leading-relaxed">{t.howCanWeHelp}</p>
        {language === 'en' && <p className="text-sm text-pwa-muted leading-relaxed mt-1">{translations.kn.howCanWeHelp}</p>}
      </div>

      {/* Action Cards */}
      <div className="space-y-4">
        {/* Report Illness Card */}
        <Link href="/report" className="block">
          <div className="bg-[#F8F2E6] rounded-[24px] p-6 flex items-start justify-between relative overflow-hidden group shadow-lg">
            <div className="z-10 w-full">
              <div className="w-10 h-10 rounded-full bg-[#E2EAD8] flex items-center justify-center mb-4">
                <Plus className="w-5 h-5 text-[#0B1C17]" />
              </div>
              <h3 className="text-[#0B1C17] font-serif font-bold text-2xl">{t.reportIllness}</h3>
              {language === 'en' && <p className="text-[#0B1C17] font-bold text-sm mb-1 mt-1">{translations.kn.reportIllness}</p>}
              <p className="text-[#0B1C17]/70 text-sm mt-3 pr-12 max-w-[85%]">{t.reportIllnessDesc}</p>
            </div>
            
            {/* Decorative leaf shape right side */}
            <div className="absolute right-[-20%] bottom-[-20%] w-64 h-64 bg-[#EBE3D0] opacity-50 rounded-tl-[100px] rounded-br-[100px] rounded-tr-[20px] rounded-bl-[20px] -rotate-12 z-0" />
            <div className="absolute right-6 top-6 w-4 h-4 rounded-full bg-[#E8C581] z-0" />
          </div>
        </Link>

        {/* View Hotspots Card */}
        <Link href="/hotspots" className="block">
          <div className="bg-[#E3EFE8] rounded-[24px] p-6 flex items-start justify-between relative overflow-hidden group shadow-lg">
            <div className="z-10 w-full">
              <div className="w-10 h-10 rounded-full bg-[#C5D9CE] flex items-center justify-center mb-4">
                <Flame className="w-5 h-5 text-[#0B1C17] fill-[#0B1C17]" />
              </div>
              <h3 className="text-[#0B1C17] font-serif font-bold text-2xl">{t.viewHotspots}</h3>
              {language === 'en' && <p className="text-[#0B1C17] font-bold text-sm mb-1 mt-1">{translations.kn.viewHotspots}</p>}
              <p className="text-[#0B1C17]/70 text-sm mt-3 pr-12 max-w-[85%]">{t.viewHotspotsDesc}</p>
            </div>
            
            {/* Decorative map shape right side */}
            <div className="absolute right-2 bottom-0 w-32 h-32 text-[#C5D9CE] opacity-50 z-0">
               <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full transform rotate-12">
                 <path d="M12 2L3 7l9 5 9-5-9-5zM3 17l9 5 9-5M3 12l9 5 9-5" />
               </svg>
            </div>
          </div>
        </Link>
      </div>

      {/* Emergency Contact Button */}
      <button className="w-full mt-6 bg-pwa-accent rounded-[20px] p-5 flex items-center justify-between text-white shadow-lg active:scale-[0.98] transition-transform">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm shrink-0">
            <Phone className="w-5 h-5 fill-white" />
          </div>
          <div className="text-left">
            <span className="block font-bold text-sm tracking-wider uppercase mb-0.5">{t.emergencyContact}</span>
            {language === 'en' && <span className="block text-xs font-medium opacity-90">{translations.kn.emergencyContact}</span>}
          </div>
        </div>
        <ChevronRight className="w-6 h-6 shrink-0" />
      </button>

    </div>
  );
}
