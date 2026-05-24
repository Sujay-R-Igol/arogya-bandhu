'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { 
  ShieldAlert, PlayCircle, X, Volume2, Video, 
  Bug, Droplets, Wind, Sparkles, ShieldCheck, Info, Activity
} from 'lucide-react';
import { useAppStore } from '@/lib/stores/appStore';
import { useSentinelStore } from '@/lib/store';
import { translations } from '@/lib/i18n/translations';

// Helper to pick category icon
const getCategoryIcon = (category: string) => {
  const cat = category?.toLowerCase() || '';
  if (cat.includes('vector') || cat.includes('mosquito') || cat.includes('dengue')) return <Bug className="w-5 h-5" />;
  if (cat.includes('water') || cat.includes('sanitation') || cat.includes('cholera')) return <Droplets className="w-5 h-5" />;
  if (cat.includes('respiratory') || cat.includes('covid')) return <Wind className="w-5 h-5" />;
  if (cat.includes('hygiene') || cat.includes('prevention')) return <Sparkles className="w-5 h-5" />;
  return <ShieldCheck className="w-5 h-5" />;
};

// Helper to extract YouTube embed URL safely
const parseYouTubeEmbedUrl = (url?: string) => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  if (match && match[2].length === 11) {
    return `https://www.youtube.com/embed/${match[2]}?autoplay=0&rel=0`;
  }
  return null;
};

export default function AlertsPage() {
  const { language, ward: userWard } = useAppStore();
  const t = translations[language];
  
  const symptomReports = useSentinelStore((state) => state.symptomReports);
  const advisories = useSentinelStore((state) => state.advisories);
  const fetchAdvisories = useSentinelStore((state) => state.fetchAdvisories);
  const subscribeToAdvisories = useSentinelStore((state) => state.subscribeToAdvisories);
  
  const [selectedMedia, setSelectedMedia] = useState<any>(null);

  useEffect(() => {
    fetchAdvisories();
    subscribeToAdvisories();
  }, [fetchAdvisories, subscribeToAdvisories]);

  // Derived Ward Status for Community Health Card
  const { wardRiskLevel, wardRiskColor, wardRiskBg, activeCasesCount, dominantDisease } = useMemo(() => {
    const wardName = userWard || 'Bhogadi';
    const activeWardReports = symptomReports.filter(r => r.status !== 'RESOLVED' && r.origin === wardName);
    
    let level = 'Awareness & Prevention';
    let color = 'text-[#2D7A50]';
    let bg = 'bg-[#E6F5ED]';
    
    const highRiskCount = activeWardReports.filter(r => r.severity === 'HIGH RISK').length;
    
    if (highRiskCount >= 5) {
      level = 'Critical Outbreak';
      color = 'text-[#E75B4B]';
      bg = 'bg-[#FFFDF7]';
    } else if (activeWardReports.length > 0) {
      level = 'Active Monitoring';
      color = 'text-[#E88C30]';
      bg = 'bg-[#FFF9F0]';
    } else {
      level = 'Baseline Awareness';
      color = 'text-[#3b82f6]';
      bg = 'bg-[#F0F7FF]';
    }

    const diseases: Record<string, number> = {};
    activeWardReports.forEach(r => {
      const cat = r.clinical_category || 'Unknown';
      diseases[cat] = (diseases[cat] || 0) + 1;
    });
    
    const domDis = Object.keys(diseases).sort((a,b) => diseases[b] - diseases[a])[0] || 'None';

    return { 
      wardRiskLevel: level, 
      wardRiskColor: color, 
      wardRiskBg: bg, 
      activeCasesCount: activeWardReports.length, 
      dominantDisease: domDis 
    };
  }, [symptomReports, userWard]);

  // Derived Nearby Area Monitoring
  const nearbyAreas = useMemo(() => {
    const wardMap: Record<string, { total: number; severity: string }> = {};
    const activeReports = symptomReports.filter(r => r.status !== 'RESOLVED');
    
    activeReports.forEach(r => {
      const w = r.origin || 'Unknown';
      if (!wardMap[w]) {
        wardMap[w] = { total: 0, severity: 'LOW' };
      }
      wardMap[w].total++;
      
      if (r.severity === 'HIGH RISK') wardMap[w].severity = 'RED';
      else if (r.severity === 'MODERATE' && wardMap[w].severity !== 'RED') wardMap[w].severity = 'ORANGE';
    });

    return Object.entries(wardMap)
      .filter(([wardName]) => wardName !== userWard && wardName !== 'Unknown')
      .map(([wardName, data]) => ({
        ward: wardName,
        count: data.total,
        severity: data.severity
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3); // top 3 nearby areas
  }, [symptomReports, userWard]);

  // Derived Urgent Alerts
  const sortedAlerts = useMemo(() => {
    const active = advisories.filter(a => a.status === 'ACTIVE' && a.media_type === 'none');
    return active.sort((a, b) => {
      if (a.affected_area === userWard && b.affected_area !== userWard) return -1;
      if (b.affected_area === userWard && a.affected_area !== userWard) return 1;
      return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
    });
  }, [advisories, userWard]);

  // Derived Media Awareness
  const sortedMedia = useMemo(() => {
    const active = advisories.filter(a => a.status === 'ACTIVE' && (a.media_type === 'audio' || a.media_type === 'video'));
    return active.sort((a, b) => {
      if (a.affected_area === userWard && b.affected_area !== userWard) return -1;
      if (b.affected_area === userWard && a.affected_area !== userWard) return 1;
      return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
    });
  }, [advisories, userWard]);

  return (
    <div className="px-5 py-6 pb-24 relative min-h-screen">
      <div className="flex justify-between items-center mb-1">
        <h1 className="text-3xl font-bold text-white">{t.alertsTitle}</h1>
      </div>
      {language === 'en' && <h2 className="text-xl font-bold text-pwa-primary mb-6">{translations.kn.alertsTitle}</h2>}

      {/* Community Health Status Card */}
      <div className="mb-8">
        <div className={`p-5 rounded-[24px] ${wardRiskBg} border border-white/10 shadow-lg`}>
          <div className="flex justify-between items-start mb-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#0B1C17]/60 block mb-0.5">Your Community</span>
              <h3 className="text-xl font-black text-[#0B1C17] leading-none">{userWard || 'Bhogadi (All)'}</h3>
            </div>
            <div className={`p-2.5 rounded-full bg-white/50 backdrop-blur-sm ${wardRiskColor} shrink-0`}>
              <Activity className="w-5 h-5" />
            </div>
          </div>
          
          <div className="mb-4">
            <h4 className={`text-sm font-bold ${wardRiskColor}`}>{userWard || 'Bhogadi'} currently under {wardRiskLevel}</h4>
          </div>

          <div className="bg-white/40 rounded-xl p-3 flex justify-between items-center">
            <div>
              <span className="text-[10px] text-[#0B1C17]/60 font-bold uppercase block mb-0.5">Active Cases</span>
              <span className="text-lg font-black text-[#0B1C17]">{activeCasesCount}</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-[#0B1C17]/60 font-bold uppercase block mb-0.5">Dominant Disease</span>
              <span className="text-sm font-bold text-[#0B1C17]">{dominantDisease}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Public Health Advisories */}
      <h3 className="text-xl font-bold text-white mb-4">Public Health Advisories</h3>
      <div className="space-y-3 mb-8">
        {sortedAlerts.length === 0 ? (
          <div className="bg-pwa-surface border border-pwa-border rounded-[24px] p-6 text-center shadow-lg">
            <Info className="w-8 h-8 text-[#2D7A50] mx-auto mb-3 opacity-50" />
            <p className="text-sm text-pwa-muted font-medium">No active public health advisories currently issued for your ward.</p>
          </div>
        ) : (
          sortedAlerts.map(adv => {
            const isRed = adv.threat_level === 'CRITICAL' || adv.threat_level === 'HIGH';
            const isOrange = adv.threat_level === 'MODERATE';
            
            const cardBg = isRed ? 'bg-[#FFFDF7]' : isOrange ? 'bg-[#FFF9F0]' : 'bg-[#E6F5ED]';
            const iconBg = isRed ? 'bg-[#E75B4B]' : isOrange ? 'bg-[#E88C30]' : 'bg-[#2D7A50]';
            const iconCol = 'text-white';
            
            return (
              <div key={adv.id} className={`${cardBg} rounded-[24px] p-5 flex gap-3 shadow-sm`}>
                <div className={`w-10 h-10 rounded-full ${iconBg} ${iconCol} flex items-center justify-center shrink-0 shadow-sm`}>
                  {getCategoryIcon(adv.category)}
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-0.5">
                    <h4 className={`text-sm font-bold ${isRed ? 'text-[#E75B4B]' : isOrange ? 'text-[#E88C30]' : 'text-[#2D7A50]'}`}>
                      {adv.title}
                    </h4>
                    {adv.affected_area === userWard && (
                      <span className="bg-blue-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-md">LOCAL</span>
                    )}
                  </div>
                  <p className="text-[9px] text-[#0B1C17]/50 font-bold uppercase tracking-wider mb-2">
                    {adv.category} • {adv.affected_area}
                  </p>
                  <p className="text-xs text-[#0B1C17]/80 leading-relaxed font-medium mb-3 whitespace-pre-wrap">
                    {adv.message}
                  </p>
                  <p className="text-[9px] text-[#0B1C17]/40 font-bold">
                    Issued {adv.created_at ? adv.created_at.split('T')[0] : ''}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Health Awareness Center */}
      <h3 className="text-xl font-bold text-white mb-4">Health Awareness Center</h3>
      <div className="space-y-4 mb-8">
        {sortedMedia.length === 0 ? (
          <div className="bg-pwa-surface border border-pwa-border rounded-[24px] p-6 text-center shadow-lg">
            <PlayCircle className="w-8 h-8 text-pwa-muted mx-auto mb-3 opacity-50" />
            <p className="text-sm text-pwa-muted font-medium">No awareness media currently published by Bhogadi PHC.</p>
          </div>
        ) : (
          sortedMedia.map((media, i) => (
            <div key={i} className="bg-pwa-surfaceLight border border-pwa-border rounded-[24px] p-5 flex flex-col shadow-lg">
              <div className="flex gap-3 items-start">
                <div className="w-12 h-12 rounded-[16px] bg-blue-500/10 flex items-center justify-center shrink-0 text-blue-400">
                  {media.media_type === 'video' ? <Video className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
                </div>
                <div className="flex-1 mb-2">
                  <h4 className="text-sm font-bold text-white leading-tight mb-0.5">{media.title}</h4>
                  <p className="text-[9px] text-pwa-accent font-bold uppercase tracking-wider mb-2 flex gap-2">
                    <span>{media.category}</span>
                    {media.affected_area === userWard && <span className="text-blue-400">LOCAL</span>}
                  </p>
                  <p className="text-xs text-pwa-muted line-clamp-2 leading-relaxed mb-4">
                    {media.message}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedMedia(media)}
                className="w-full py-3 rounded-xl bg-pwa-accent text-white font-bold text-xs flex items-center justify-center gap-2 hover:bg-opacity-90 transition active:scale-95 shadow-md shadow-pwa-accent/20"
              >
                {media.media_type === 'video' ? (
                  <><PlayCircle className="w-4 h-4" /> Watch Video</>
                ) : (
                  <><Volume2 className="w-4 h-4" /> Play Audio Message</>
                )}
              </button>
            </div>
          ))
        )}
      </div>

      {/* Nearby Area Monitoring */}
      {nearbyAreas.length > 0 && (
        <div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3">Nearby Area Monitoring</h3>
          <div className="bg-pwa-surface border border-pwa-border rounded-2xl p-4 shadow-lg">
            <ul className="divide-y divide-pwa-border">
              {nearbyAreas.map((area, idx) => (
                <li key={idx} className="py-2.5 flex justify-between items-center first:pt-0 last:pb-0">
                  <span className="text-sm font-semibold text-white">{area.ward}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-pwa-muted font-medium">{area.count} cases</span>
                    <span className={`w-2.5 h-2.5 rounded-full ${
                      area.severity === 'RED' ? 'bg-[#E75B4B] animate-pulse shadow-[0_0_8px_#E75B4B]' : 
                      area.severity === 'ORANGE' ? 'bg-[#E88C30]' : 'bg-[#2D7A50]'
                    }`} />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Inline Media Modal */}
      {selectedMedia && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-5 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-[#1A2E26] border border-pwa-border rounded-3xl overflow-hidden shadow-2xl">
            <div className="p-4 flex justify-between items-center border-b border-white/5 bg-[#0B1C17]">
              <h3 className="text-sm font-bold text-white truncate pr-4">{selectedMedia.title}</h3>
              <button 
                onClick={() => setSelectedMedia(null)}
                className="p-1.5 bg-white/10 rounded-full text-white/80 hover:text-white transition active:scale-95"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 flex flex-col items-center">
              {/* Actual Embedded Media Player */}
              <div className="w-full bg-black rounded-xl border border-white/10 flex flex-col items-center justify-center mb-4 relative overflow-hidden">
                {(() => {
                  if (selectedMedia.media_type === 'video') {
                    const embedUrl = parseYouTubeEmbedUrl(selectedMedia.media_url);
                    if (embedUrl) {
                      return (
                        <iframe 
                          src={embedUrl}
                          className="w-full aspect-video"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          title={selectedMedia.title}
                        />
                      );
                    }
                  } else if (selectedMedia.media_type === 'audio') {
                    if (selectedMedia.media_url) {
                      return (
                        <div className="w-full p-4 flex flex-col items-center bg-[#0B1C17]">
                          <Volume2 className="w-10 h-10 text-pwa-accent mb-3" />
                          <audio 
                            controls 
                            controlsList="nodownload"
                            className="w-full outline-none"
                            src={selectedMedia.media_url}
                          >
                            Your browser does not support the audio element.
                          </audio>
                        </div>
                      );
                    }
                  }
                  
                  // Graceful Fallback for invalid or missing URLs
                  return (
                    <div className="w-full aspect-video flex flex-col items-center justify-center bg-[#0B1C17]/50 p-4 text-center">
                      <Info className="w-8 h-8 text-white/20 mb-2" />
                      <span className="text-xs text-white/50 font-medium">Media currently unavailable.</span>
                    </div>
                  );
                })()}
              </div>

              <p className="text-xs text-pwa-muted text-center leading-relaxed bg-black/20 p-3 rounded-xl border border-white/5 w-full">
                {selectedMedia.message}
              </p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
