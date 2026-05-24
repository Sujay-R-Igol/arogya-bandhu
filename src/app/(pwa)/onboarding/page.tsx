'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';
import { useAppStore } from '@/lib/stores/appStore';
import { signupUser } from '@/lib/api/auth';
import { BHOGADI_ZONES } from '@/lib/store';
import { translations } from '@/lib/i18n/translations';
import { ChevronRight, X, Phone, User, MapPin, Lock, Activity, ShieldCheck, HeartPulse } from 'lucide-react';
import Link from 'next/link';

export default function OnboardingPage() {
  const router = useRouter();
  const {
    language,
    setIsLoggedIn,
    setRole,
    setDisplayName,
    setWard,
    setUserId,
    setUsername,
    setPhone,
  } = useAppStore();
  const t = translations[language] as any;

  const [role, setLocalRole] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [ward, setLocalWard] = useState<string>('');
  const [phone, setLocalPhone] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSignup = async () => {
    if (!role) return;
    
    // For anonymous reporter we generate a simple username if none provided
    const username = role === 'Anonymous Reporter' && !name ? `anon-${uuidv4().slice(0, 8)}` : name || 'unknown';
    // If no password provided, fallback to random (though UI prompts for it now)
    const finalPassword = password || uuidv4();
    
    setIsSubmitting(true);
    setError('');

    try {
      const user = await signupUser({ username, password: finalPassword, role, ward, phone });
      // Populate store with returned user data
      setUserId(user.id);
      setUsername(user.username);
      setRole(user.role);
      setDisplayName(user.username);
      setWard(user.ward);
      if (user.phone) setPhone(user.phone);
      setIsLoggedIn(true);
      router.replace('/home');
    } catch (e: any) {
      console.error('Signup failed', e);
      setError('Failed to create account. Username might be taken.');
      setIsSubmitting(false);
    }
  };

  const closeMenu = () => {
    setLocalRole('');
    setError('');
  };

  const ROLES = [
    { id: 'ASHA Worker', title: 'ASHA Worker', desc: 'Official healthcare provider access', icon: HeartPulse, color: 'text-emerald-500' },
    { id: 'Resident', title: 'Resident', desc: 'Join your community network', icon: User, color: 'text-blue-500' },
    { id: 'Anonymous Reporter', title: 'Anonymous Reporter', desc: 'Submit alerts without revealing identity', icon: ShieldCheck, color: 'text-purple-500' },
  ];

  return (
    <div className="relative min-h-screen bg-pwa-bg flex flex-col items-center justify-center px-6 py-12 overflow-hidden font-sans text-white">
      
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-pwa-surface to-transparent opacity-50 pointer-events-none" />
      <div className="absolute top-20 right-[-10%] w-72 h-72 bg-pwa-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-[-10%] w-64 h-64 bg-pwa-primary/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-sm z-10 flex flex-col items-center relative">
        
        {/* Logo & App Name */}
        <div className="flex flex-col items-center justify-center mb-10 animate-in slide-in-from-bottom-4 fade-in duration-700">
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
          
          <h1 className="font-extrabold text-4xl tracking-tight text-white mb-2 text-center">
            Arogya<span className="text-pwa-primary">bandhu</span>
          </h1>
          <p className="text-pwa-muted text-sm font-medium tracking-wide text-center max-w-[250px]">
            Smart Health Alerts for Rural Communities
          </p>
        </div>

        {/* Role Selection */}
        <div className="w-full space-y-3 mb-8">
          {ROLES.map((r, i) => {
            const Icon = r.icon;
            return (
              <button
                key={r.id}
                onClick={() => setLocalRole(r.id)}
                className="w-full bg-pwa-surface backdrop-blur-md border border-pwa-border shadow-sm hover:shadow-md hover:bg-pwa-surfaceLight hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-300 p-4 rounded-2xl flex items-center gap-4 group animate-in slide-in-from-bottom-4 fade-in"
                style={{ animationDelay: `${i * 100 + 300}ms`, animationFillMode: 'both' }}
              >
                <div className={`w-12 h-12 rounded-xl bg-pwa-bg flex items-center justify-center shadow-inner group-hover:bg-pwa-surfaceLight transition-colors ${r.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="flex-1 text-left">
                  <h3 className="font-bold text-white text-base">{r.title}</h3>
                  <p className="text-xs text-pwa-muted font-medium">{r.desc}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-pwa-muted group-hover:text-pwa-primary transition-colors" />
              </button>
            )
          })}
        </div>

        <div className="animate-in fade-in duration-700 delay-700 fill-mode-both text-center">
          <p className="text-sm text-pwa-muted font-medium">
            Already have an account?{' '}
            <Link href="/login" className="text-pwa-primary font-bold hover:text-white transition-colors">
              Sign In
            </Link>
          </p>
        </div>
      </div>

      {/* MODAL POPUP FOR FORMS */}
      {role && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={closeMenu} />
          <div className="relative w-full max-w-sm bg-pwa-surface border border-pwa-border rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 fade-in duration-200">
            
            {/* Modal Header */}
            <div className="bg-pwa-surfaceLight p-6 border-b border-pwa-border flex justify-between items-start">
              <div>
                <span className="inline-block px-2.5 py-1 rounded-full bg-pwa-primary/10 text-pwa-primary text-[10px] font-bold tracking-wider uppercase mb-2">
                  {role} Registration
                </span>
                <h2 className="text-xl font-bold text-white">Welcome to Arogyabandhu</h2>
                <p className="text-pwa-muted text-xs mt-1">Please enter your details to continue</p>
              </div>
              <button onClick={closeMenu} className="p-1 rounded-full bg-pwa-bg hover:bg-pwa-border transition-colors">
                <X className="w-5 h-5 text-pwa-muted" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              {role !== 'Anonymous Reporter' && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-pwa-muted uppercase tracking-wide mb-1.5 ml-1">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-pwa-muted" />
                      <input
                        type="text"
                        placeholder="John Doe"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-pwa-bg border border-pwa-border text-white placeholder-pwa-muted/50 focus:border-pwa-primary focus:ring-1 focus:ring-pwa-primary outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-pwa-muted uppercase tracking-wide mb-1.5 ml-1">Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-pwa-muted" />
                      <input
                        type="tel"
                        placeholder="+91 98765 43210"
                        value={phone}
                        onChange={(e) => setLocalPhone(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-pwa-bg border border-pwa-border text-white placeholder-pwa-muted/50 focus:border-pwa-primary focus:ring-1 focus:ring-pwa-primary outline-none transition-all"
                      />
                    </div>
                  </div>
                </>
              )}

              {role === 'Anonymous Reporter' && (
                <div>
                  <label className="block text-xs font-bold text-pwa-muted uppercase tracking-wide mb-1.5 ml-1">Nickname (Optional)</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-pwa-muted" />
                    <input
                      type="text"
                      placeholder="E.g. Concerned Citizen"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-pwa-bg border border-pwa-border text-white placeholder-pwa-muted/50 focus:border-pwa-primary focus:ring-1 focus:ring-pwa-primary outline-none transition-all"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-pwa-muted uppercase tracking-wide mb-1.5 ml-1">Area / Ward</label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-pwa-muted" />
                  <select
                    value={ward}
                    onChange={(e) => setLocalWard(e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 rounded-xl bg-pwa-bg border border-pwa-border focus:border-pwa-primary focus:ring-1 focus:ring-pwa-primary outline-none transition-all appearance-none ${!ward ? 'text-pwa-muted/50' : 'text-white'}`}
                  >
                    <option value="" disabled className="text-pwa-bg">Select your location</option>
                    {BHOGADI_ZONES.map(zone => (
                      <option key={zone.id} value={zone.id} className="text-white bg-pwa-surface">{zone.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-pwa-muted uppercase tracking-wide mb-1.5 ml-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-pwa-muted" />
                  <input
                    type="password"
                    placeholder="Create a secure password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-pwa-bg border border-pwa-border text-white placeholder-pwa-muted/50 focus:border-pwa-primary focus:ring-1 focus:ring-pwa-primary outline-none transition-all"
                  />
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs font-medium flex items-center gap-2">
                  <Activity className="w-4 h-4 shrink-0" />
                  <p>{error}</p>
                </div>
              )}

              <div className="pt-2 flex gap-3">
                <button
                  onClick={closeMenu}
                  className="flex-1 py-3.5 rounded-xl font-bold text-pwa-muted bg-pwa-bg hover:bg-pwa-border active:bg-pwa-border/80 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSignup}
                  disabled={isSubmitting || (!name && role !== 'Anonymous Reporter') || (!phone && role !== 'Anonymous Reporter') || !ward || !password}
                  className="flex-[2] py-3.5 rounded-xl font-bold text-pwa-bg bg-pwa-primary shadow-lg shadow-pwa-primary/10 hover:bg-white active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none transition-all"
                >
                  {isSubmitting ? 'Processing...' : role === 'Anonymous Reporter' ? 'Continue Anonymously' : 'Create Account'}
                </button>
              </div>
            </div>
            
          </div>
        </div>
      )}
    </div>
  );
}
