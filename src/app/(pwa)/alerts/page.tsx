'use client';

import React, { useEffect } from 'react';
import { ShieldAlert, PlayCircle, Volume2 } from 'lucide-react';
import { useAppStore } from '@/lib/stores/appStore';
import { useSentinelStore } from '@/lib/store';
import { translations } from '@/lib/i18n/translations';

export default function AlertsPage() {
  const { language } = useAppStore();
  const advisories = useSentinelStore((state) => state.advisories);
  const t = translations[language];
  const fetchAdvisories = useSentinelStore((state) => state.fetchAdvisories);
  const subscribeToAdvisories = useSentinelStore((state) => state.subscribeToAdvisories);

  // Load advisories once and keep them in sync via realtime subscription
  useEffect(() => {
    fetchAdvisories();
    subscribeToAdvisories();
  }, []);


  // Only show ACTIVE advisories in PWA
  const activeAdvisories = advisories.filter(a => a.status === 'ACTIVE');

  return (
    <div className="px-5 py-6 pb-24">
      <div className="flex items-center gap-3 mb-2">
        <h1 className="text-3xl font-bold text-white">{t.alertsTitle}</h1>
        <span className="bg-pwa-accent text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
          {activeAdvisories.length} New
        </span>
      </div>
      {language === 'en' && <h2 className="text-xl font-bold text-pwa-primary mb-3">{translations.kn.alertsTitle}</h2>}
      <p className="text-sm text-pwa-muted mb-8 leading-relaxed">
        {t.stayUpdated}
      </p>

      <div className="space-y-5">
        {activeAdvisories.length === 0 ? (
          <p className="text-slate-400 text-sm italic">No active advisories in your area.</p>
        ) : (
          activeAdvisories.map((adv) => {
            const isUrgent = adv.threat_level === 'CRITICAL' || adv.threat_level === 'HIGH';
            const isVideo = adv.media_type === 'video';
            const isAudio = adv.media_type === 'audio';

            // Choose styles based on threat level
            const cardBg = isUrgent ? 'bg-[#FFFDF7]' : adv.threat_level === 'MODERATE' ? 'bg-[#E6F5ED]' : 'bg-pwa-surface border border-pwa-border';
            const titleColor = isUrgent ? 'text-[#0B1C17]' : adv.threat_level === 'MODERATE' ? 'text-[#0B1C17]' : 'text-white';
            const descColor = isUrgent ? 'text-[#0B1C17]/70' : adv.threat_level === 'MODERATE' ? 'text-[#0B1C17]/70' : 'text-pwa-muted';

            return (
              <div key={adv.id} className={`${cardBg} rounded-[24px] overflow-hidden ${!isUrgent && adv.threat_level !== 'MODERATE' ? '' : 'shadow-lg'}`}>
                <div className="p-5">
                  <div className="flex justify-between items-center mb-3">
                    <span className={`text-[11px] font-bold tracking-widest uppercase ${isUrgent ? 'text-pwa-accent' : adv.threat_level === 'MODERATE' ? 'text-[#2D7A50]' : 'text-blue-400'}`}>
                      {isUrgent ? '⚠ Urgent' : adv.threat_level === 'MODERATE' ? '📢 Update' : 'ℹ Info'}
                    </span>
                    <span className={`text-[10px] font-medium ${isUrgent ? 'text-gray-400' : 'text-[#0B1C17]/40'}`}>
                      {adv.created_at ? adv.created_at.split('T')[0] : ''}
                    </span>
                  </div>
                  
                  <div className="flex items-start gap-3 mb-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${isUrgent ? 'bg-red-100 text-pwa-accent' : adv.threat_level === 'MODERATE' ? 'bg-white text-[#2D7A50] shadow-sm' : 'bg-blue-500/20'}`}>
                      {isUrgent ? <ShieldAlert className="w-5 h-5" /> : adv.threat_level === 'MODERATE' ? <span className="text-xl">💉</span> : <span className="text-xl">💧</span>}
                    </div>
                    <div>
                      <h2 className={`${titleColor} font-bold text-xl leading-tight`}>{adv.title}</h2>
                      <p className={`${titleColor} opacity-60 font-medium text-xs mt-0.5 uppercase tracking-wider`}>{adv.affected_area}</p>
                    </div>
                  </div>
                  
                  {isUrgent ? (
                    <p className={`${descColor} text-sm bg-black/5 p-3 rounded-xl mb-5 leading-relaxed font-medium`}>
                      {adv.message}
                    </p>
                  ) : (
                    <p className={`${descColor} text-sm mt-2 leading-relaxed mb-4`}>
                      {adv.message}
                    </p>
                  )}
                  
                  {isAudio && adv.media_url && (
                    <a href={adv.media_url} target="_blank" rel="noreferrer" className="w-full py-3.5 rounded-2xl bg-pwa-accent text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-pwa-accent/20">
                      <Volume2 className="w-4 h-4" />
                      Play Audio Message
                    </a>
                  )}

                  {isVideo && adv.media_url && (
                    <div className="flex items-center gap-3">
                      <a href={adv.media_url} target="_blank" rel="noreferrer" className="bg-[#0B1C17]/10 text-[#0B1C17]/70 text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5">
                        <PlayCircle className="w-3.5 h-3.5" />
                        Watch Guide
                      </a>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
