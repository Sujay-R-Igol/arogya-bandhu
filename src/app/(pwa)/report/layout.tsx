'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { BriefcaseMedical } from 'lucide-react';
import { useAppStore } from '@/lib/stores/appStore';
import { translations } from '@/lib/i18n/translations';

// Layout for pages that should not show the bottom navigation (e.g., Report flow)
export default function FlowLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { language, toggleLanguage } = useAppStore();
  const t = translations[language];

  return (
    <div className="min-h-screen bg-black flex justify-center text-white font-sans">
      <div className="w-full max-w-md bg-pwa-bg h-screen flex flex-col relative shadow-2xl overflow-hidden">
        {/* Header */}
        <header className="px-5 pt-6 pb-4 flex items-center justify-between z-10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-pwa-primary flex items-center justify-center">
              <BriefcaseMedical className="w-5 h-5 text-pwa-bg" strokeWidth={2} />
            </div>
            <span className="font-bold text-base tracking-wide text-white">Rural Health</span>
          </div>
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1.5 text-xs px-4 py-2 rounded-full border border-pwa-border text-white hover:bg-pwa-surface transition-colors"
          >
            <span className={language === 'en' ? 'font-bold' : 'text-pwa-muted'}>EN</span>
            <span className="text-pwa-muted">/</span>
            <span className={language === 'kn' ? 'font-bold' : 'text-pwa-muted'}>ಕ</span>
          </button>
        </header>
        {/* Main Content */}
        <main className="flex-1 overflow-y-auto pb-24 scrollbar-hide">
          {children}
        </main>
        {/* No bottom navigation – page will manage its own footer/buttons */}
      </div>
    </div>
  );
}
