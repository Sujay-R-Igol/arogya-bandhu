'use client';

import React from 'react';
import { useAppStore } from '@/lib/stores/appStore';

// Full-screen layout for flows that don't show the bottom nav (e.g. Report flow)
export default function FullscreenFlowLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-black flex justify-center text-white font-sans">
      <div className="w-full max-w-md bg-pwa-bg h-screen flex flex-col relative shadow-2xl overflow-hidden">
        {children}
      </div>
    </div>
  );
}
