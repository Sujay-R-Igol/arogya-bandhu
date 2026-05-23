'use client';

import React from 'react';
import { User, ChevronRight, Settings, MapPin, Bell, Info, LogOut } from 'lucide-react';
import { useAppStore } from '@/lib/stores/appStore';
import { translations } from '@/lib/i18n/translations';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const { language, setIsLoggedIn, role, setRole, displayName, setDisplayName, ward, setWard } = useAppStore();
  const router = useRouter();
  const t = translations[language] as any;

  const handleLogout = () => {
    setIsLoggedIn(false);
    setRole('');
    setDisplayName('');
    setWard('');
    router.replace('/onboarding');
  };

  const menuItems = [
    { icon: Settings, label: t.languageSettings, value: language === 'en' ? 'English >' : 'ಕನ್ನಡ >' },
    { icon: MapPin, label: t.myVillage, value: ward ? `${ward} >` : 'Unknown >' },
    { icon: Bell, label: t.notifications, value: 'Enabled >' },
    { icon: Info, label: t.about, value: 'v1.0.0 >' },
  ];

  return (
    <div className="px-5 py-6">
      <h1 className="text-2xl font-bold text-white mb-6">{t.profileTitle}</h1>
      
      {/* User Info */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-16 h-16 rounded-full bg-pwa-surfaceLight flex items-center justify-center text-pwa-muted border border-pwa-border">
          <User className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-white font-bold text-lg">{displayName || 'User'}</h2>
          <p className="text-pwa-muted text-xs">{role || 'Resident'}</p>
          <p className="text-pwa-muted text-xs">{ward || 'Unknown location'}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="flex gap-3 mb-8">
        {[
          { count: 7, label: t.reportsCount },
          { count: 3, label: t.alertsCount },
          { count: 2, label: t.sosCount },
        ].map((stat, i) => (
          <div key={i} className="flex-1 bg-pwa-surface rounded-xl py-3 flex flex-col items-center justify-center border border-pwa-border">
            <span className="text-2xl font-bold text-white mb-1">{stat.count}</span>
            <span className="text-[10px] text-pwa-muted uppercase tracking-wider">{stat.label}</span>
          </div>
        ))}
      </div>

      {/* Menu Options */}
      <div className="bg-pwa-surface rounded-2xl border border-pwa-border overflow-hidden mb-6">
        {menuItems.map((item, i) => {
          const Icon = item.icon;
          return (
            <button key={i} className="w-full flex items-center justify-between p-4 hover:bg-pwa-surfaceLight transition-colors border-b border-pwa-border last:border-b-0">
              <div className="flex items-center gap-3">
                <Icon className="w-4 h-4 text-pwa-muted" />
                <span className="text-sm font-semibold text-white">{item.label}</span>
              </div>
              <span className="text-xs text-pwa-muted">{item.value}</span>
            </button>
          );
        })}
      </div>

      {/* Sign Out Button */}
      <button onClick={handleLogout} className="w-full py-4 rounded-xl border border-red-500/30 text-red-500 font-bold text-sm hover:bg-red-500/10 transition-colors">
        {t.signOut}
      </button>
    </div>
  );
}
