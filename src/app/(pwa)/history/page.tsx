// src/app/(pwa)/history/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { Thermometer, Droplet } from 'lucide-react';
import { useAppStore } from '@/lib/stores/appStore';
import { translations } from '@/lib/i18n/translations';
import { supabaseClient } from '@/lib/supabase/client';

interface ReportItem {
  id: number;
  disease: string;
  severity: string;
  location: string;
  created_at: string;
  [key: string]: any;
}

export default function HistoryPage() {
  const { language, userId, isLoggedIn } = useAppStore();
  const t = translations[language] as any;
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('all');

  const fetchReports = async () => {
    if (!userId) return;
    setLoading(true);
    const { data, error } = await supabaseClient
      .from('health_reports')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) {
      setError(error.message);
    } else {
      setReports(data as ReportItem[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (isLoggedIn) {
      fetchReports();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, isLoggedIn]);

  const filtered = reports.filter((item) => {
    if (activeTab === 'all') return true;
    // future tab filters can be added here
    return true;
  });

  if (!isLoggedIn) {
    return (
      <div className="px-5 py-6 text-pwa-muted">
        {t.notLoggedIn || 'Please log in to view your history.'}
      </div>
    );
  }

  return (
    <div className="px-5 py-6">
      <h1 className="text-3xl font-bold text-white mb-1">{t.historyTitle}</h1>
      {language === 'en' && (
        <h2 className="text-xl font-bold text-pwa-primary mb-6">
          {translations.kn.historyTitle}
        </h2>
      )}

      {/* Tabs placeholder */}
      <div className="flex gap-2 mb-6 bg-pwa-surface p-1 rounded-full">
        {['all' /*, 'reports', 'alerts'*/].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2.5 text-xs font-bold rounded-full transition-all ${
              activeTab === tab ? 'bg-white text-pwa-bg shadow-sm' : 'text-pwa-muted'
            }`}
          >
            {tab === 'all' ? t.tabAll : tab}
          </button>
        ))}
      </div>

      {loading && <p className="text-pwa-muted">{t.loading || 'Loading...'}</p>}
      {error && <p className="text-red-500">{error}</p>}

      <div className="space-y-3">
        {filtered.map((item) => {
          const Icon = item.severity === 'emergency' ? Droplet : Thermometer;
          return (
            <div key={item.id} className="bg-pwa-surface rounded-2xl p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 bg-pwa-primary/20">
                <Icon className="w-5 h-5 text-pwa-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <div className="min-w-0 flex-1">
                    <h3 className="text-white font-semibold text-sm truncate">{item.disease}</h3>
                    <p className="text-pwa-muted text-[11px] mt-0.5">{item.severity}</p>
                  </div>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full ml-2 shrink-0 bg-pwa-primary/10 text-pwa-primary">
                    {item.created_at ? item.created_at.split('T')[0] : ''}
                  </span>
                </div>
                <p className="text-pwa-muted text-[10px] mt-1.5">{item.location}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
