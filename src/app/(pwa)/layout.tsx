'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Home, MapPin, Clock, Bell, User } from 'lucide-react';
import { useAppStore } from '@/lib/stores/appStore';
import { translations } from '@/lib/i18n/translations';

export default function PWALayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { language, toggleLanguage, isLoggedIn } = useAppStore();
  const router = useRouter();
  const t = translations[language];

  const [isMounted, setIsMounted] = React.useState(false);
  
  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  const isAuthRoute = pathname.startsWith('/onboarding') || pathname.startsWith('/login');
  const isReportRoute = pathname.startsWith('/report');
  const hideGlobalUI = isAuthRoute || isReportRoute;

  // If user is not logged in and not already on onboarding or login, redirect
  React.useEffect(() => {
    if (isMounted && !isLoggedIn && !isAuthRoute) {
      router.replace('/onboarding');
    }
  }, [isLoggedIn, isAuthRoute, router, isMounted]);

  // Auth gate to completely prevent UI rendering/flicker while redirecting
  if (!isMounted || (!isLoggedIn && !isAuthRoute)) {
    return <div className="min-h-screen bg-pwa-bg flex items-center justify-center" />;
  }

  const navItems = [
    { icon: Home, label: t.home, path: '/home' },
    { icon: Clock, label: t.history, path: '/history' },
    { icon: Bell, label: t.alerts, path: '/alerts' },
    { icon: User, label: t.profile, path: '/profile' },
  ];

  // If it's a route that handles its own layout entirely (like /report),
  // we might want to bypass the outer container as well.
  // Wait, if it's nested inside the outer layout, the outer layout still renders its wrapper.
  if (isReportRoute) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-black flex justify-center text-white font-sans">
      <div className="w-full max-w-md bg-pwa-bg h-screen flex flex-col relative shadow-2xl overflow-hidden">
        
        {/* Header */}
        {!hideGlobalUI && (
          <header className="px-5 pt-6 pb-4 flex items-center justify-between z-10 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#080d0b] flex items-center justify-center overflow-hidden border border-pwa-border shadow-inner relative">
                <img 
                  src="/logo.png" 
                  alt="Arogya Bandhu" 
                  className="w-[115%] h-[115%] object-cover mix-blend-screen absolute" 
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
              </div>
              <span className="font-extrabold text-base tracking-wide text-white">Arogya<span className="text-pwa-primary">bandhu</span></span>
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
        )}

        {/* Main Content Area */}
        <main className={`flex-1 overflow-y-auto scrollbar-hide ${!hideGlobalUI ? 'pb-24' : ''}`}>
          {children}
        </main>

        {/* Bottom Navigation */}
        {!hideGlobalUI && (
          <nav className="absolute bottom-0 w-full bg-pwa-bg border-t border-pwa-border/50 px-4 pt-3 pb-6 z-20">
            <div className="flex items-end justify-between">
              {navItems.map((item) => {
                const isActive = pathname === item.path || pathname?.startsWith(item.path + '/');
                const Icon = item.icon;
                return (
                  <Link 
                    key={item.path} 
                    href={item.path}
                    className="flex flex-col items-center gap-1.5 flex-1"
                  >
                    <Icon 
                      className={`w-5 h-5 transition-colors ${isActive ? 'text-pwa-primary' : 'text-pwa-muted'}`}
                      strokeWidth={isActive ? 2.5 : 1.8}
                      fill={isActive ? 'rgba(162,215,197,0.15)' : 'none'}
                    />
                    <span className={`text-[10px] font-medium transition-colors ${isActive ? 'text-pwa-primary font-semibold' : 'text-pwa-muted'}`}>
                      {item.label}
                    </span>
                  </Link>
                );
              })}
            </div>
          </nav>
        )}
        
      </div>
    </div>
  );
}
