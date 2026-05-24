'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';
import { useAppStore } from '@/lib/stores/appStore';
import { signupUser } from '@/lib/api/auth';
import { BHOGADI_ZONES } from '@/lib/store';
import { translations } from '@/lib/i18n/translations';
import { BriefcaseMedical } from 'lucide-react';

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

  return (
    <div className="flex flex-col h-full min-h-screen bg-pwa-bg px-5 py-8 overflow-y-auto scrollbar-hide">
      
      {/* Logo & App Name */}
      <div className="flex flex-col items-center justify-center mt-4 mb-8">
        <div className="w-16 h-16 rounded-2xl bg-pwa-primary flex items-center justify-center mb-4 shadow-lg shadow-pwa-primary/20">
          <BriefcaseMedical className="w-8 h-8 text-pwa-bg" strokeWidth={2.5} />
        </div>
        <h1 className="font-bold text-2xl tracking-wide text-white">Rural Health</h1>
        <p className="text-pwa-muted text-sm mt-1">Create your account to get started</p>
      </div>

      {/* Role Selection */}
      <div className="space-y-4 mb-6">
        <h2 className="text-lg font-bold text-white">{t.selectRole}</h2>
        <div className="grid grid-cols-1 gap-3">
          {['ASHA Worker', 'Resident', 'Anonymous Reporter'].map((r) => (
            <button
              key={r}
              onClick={() => setLocalRole(r)}
              className={`p-4 rounded-xl border-2 flex items-center justify-center transition-all ${
                role === r 
                  ? 'bg-pwa-primary/10 border-pwa-primary text-pwa-primary font-bold' 
                  : 'bg-pwa-surface border-transparent text-white'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Input Fields */}
      {role && (
        <div className="space-y-4 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <h2 className="text-lg font-bold text-white">{t.enterDetails}</h2>
          
          <div className="space-y-3">
            {role !== 'Anonymous Reporter' && (
              <>
                <input
                  type="text"
                  placeholder={t.displayNamePlaceholder || "Your Full Name"}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-4 rounded-xl bg-pwa-surface text-white placeholder-pwa-muted border-2 border-transparent focus:border-pwa-primary outline-none transition-colors"
                />
                <input
                  type="tel"
                  placeholder="Phone Number"
                  value={phone}
                  onChange={(e) => setLocalPhone(e.target.value)}
                  className="w-full p-4 rounded-xl bg-pwa-surface text-white placeholder-pwa-muted border-2 border-transparent focus:border-pwa-primary outline-none transition-colors"
                />
              </>
            )}
            
            <select
              value={ward}
              onChange={(e) => setLocalWard(e.target.value)}
              className="w-full p-4 rounded-xl bg-pwa-surface text-white placeholder-pwa-muted border-2 border-transparent focus:border-pwa-primary outline-none transition-colors appearance-none"
            >
              <option value="" disabled>Select Ward of Observation</option>
              {BHOGADI_ZONES.map(zone => (
                <option key={zone.id} value={zone.id}>{zone.label}</option>
              ))}
            </select>

            <input
              type="password"
              placeholder="Create an Account Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-4 rounded-xl bg-pwa-surface text-white placeholder-pwa-muted border-2 border-transparent focus:border-pwa-primary outline-none transition-colors"
            />
          </div>
          
          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            onClick={handleSignup}
            disabled={isSubmitting || !role || (!name && role !== 'Anonymous Reporter') || (!phone && role !== 'Anonymous Reporter') || !password}
            className="w-full mt-4 py-4 rounded-xl bg-pwa-primary text-pwa-bg font-bold shadow-lg disabled:opacity-50 transition-opacity"
          >
            {isSubmitting ? 'Creating Account...' : 'Create Account'}
          </button>
        </div>
      )}

      {/* Login Link */}
      <div className="mt-auto pt-8 text-center pb-4">
        <p className="text-pwa-muted text-sm mb-2">Already have an account?</p>
        <button onClick={() => router.push('/login')} className="text-pwa-primary font-bold text-sm">
          Login here
        </button>
      </div>

    </div>
  );
}
