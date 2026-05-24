'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { loginUser } from '@/lib/api/auth';
import { useAppStore } from '@/lib/stores/appStore';
import { ArrowLeft, User, Lock, Activity } from 'lucide-react';
import { translations } from '@/lib/i18n/translations';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const { language, setIsLoggedIn, setUserId, setUsername, setRole, setDisplayName, setWard, setPhone } = useAppStore();
  const t = translations[language] as any;

  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const user = await loginUser({ username: usernameInput, password: passwordInput });
      setUserId(user.id);
      setUsername(user.username);
      setRole(user.role);
      setDisplayName(user.username);
      setWard(user.ward);
      if (user.phone) setPhone(user.phone);
      setIsLoggedIn(true);
      router.replace('/home');
    } catch (err: any) {
      console.error('Login failed', err);
      setError('Invalid username or password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-pwa-bg flex flex-col items-center justify-center px-6 py-12 overflow-hidden font-sans text-white">
      
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-pwa-surface to-transparent opacity-50 pointer-events-none" />
      <div className="absolute top-20 right-[-10%] w-72 h-72 bg-pwa-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-[-10%] w-64 h-64 bg-pwa-primary/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-sm z-10 flex flex-col items-center relative animate-in zoom-in-95 fade-in duration-300">
        
        {/* Back Button */}
        <div className="w-full mb-6">
          <button onClick={() => router.back()} className="text-pwa-muted flex items-center gap-2 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" /> Back
          </button>
        </div>

        {/* Logo */}
        <div className="flex flex-col items-center justify-center mb-8">
          <div className="w-32 h-32 mb-6 relative rounded-[2rem] p-0.5 bg-gradient-to-br from-pwa-primary/30 via-pwa-border to-pwa-surface shadow-[0_10px_40px_-10px_rgba(162,215,197,0.2)]">
            <div className="w-full h-full rounded-[1.8rem] overflow-hidden bg-[#080d0b] relative flex items-center justify-center shadow-inner">
              <img 
                src="/logo.png" 
                alt="Arogya Bandhu Logo" 
                className="w-[115%] h-[115%] max-w-none object-cover mix-blend-screen" 
                onError={(e) => { 
                  e.currentTarget.style.display = 'none'; 
                  e.currentTarget.nextElementSibling?.classList.remove('hidden'); 
                }} 
              />
              <div className="hidden absolute inset-0 rounded-[1.8rem] shadow-xl flex items-center justify-center bg-pwa-surface">
                <Activity className="w-12 h-12 text-pwa-primary" />
              </div>
            </div>
          </div>
          
          <h1 className="font-extrabold text-3xl tracking-tight text-white mb-2 text-center">
            Welcome Back
          </h1>
          <p className="text-pwa-muted text-sm font-medium tracking-wide text-center">
            Sign in to continue to Arogyabandhu
          </p>
        </div>

        {/* Login Form Container (Glassmorphism) */}
        <div className="w-full bg-pwa-surface/80 backdrop-blur-md border border-pwa-border rounded-3xl p-6 shadow-2xl">
          <form onSubmit={handleLogin} className="space-y-4">
            
            <div>
              <label className="block text-xs font-bold text-pwa-muted uppercase tracking-wide mb-1.5 ml-1">Username</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-pwa-muted" />
                <input
                  type="text"
                  placeholder="Enter your username"
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-pwa-bg border border-pwa-border text-white placeholder-pwa-muted/50 focus:border-pwa-primary focus:ring-1 focus:ring-pwa-primary outline-none transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-pwa-muted uppercase tracking-wide mb-1.5 ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-pwa-muted" />
                <input
                  type="password"
                  placeholder="Enter your password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-pwa-bg border border-pwa-border text-white placeholder-pwa-muted/50 focus:border-pwa-primary focus:ring-1 focus:ring-pwa-primary outline-none transition-all"
                  required
                />
              </div>
            </div>
            
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs font-medium flex items-center gap-2 animate-in fade-in zoom-in duration-200">
                <Activity className="w-4 h-4 shrink-0" />
                <p>{error}</p>
              </div>
            )}

            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting || !usernameInput || !passwordInput}
                className="w-full py-3.5 rounded-xl font-bold text-pwa-bg bg-pwa-primary shadow-lg shadow-pwa-primary/10 hover:bg-white active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none transition-all"
              >
                {isSubmitting ? 'Logging in...' : 'Sign In'}
              </button>
            </div>
          </form>
        </div>

        {/* Footer Link */}
        <div className="mt-8 text-center">
          <p className="text-sm text-pwa-muted font-medium">
            Don't have an account?{' '}
            <Link href="/onboarding" className="text-pwa-primary font-bold hover:text-white transition-colors">
              Create one
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}
