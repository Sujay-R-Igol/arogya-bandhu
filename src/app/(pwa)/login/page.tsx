'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { loginUser } from '@/lib/api/auth';
import { useAppStore } from '@/lib/stores/appStore';
import { ArrowLeft } from 'lucide-react';
import { translations } from '@/lib/i18n/translations';

export default function LoginPage() {
  const router = useRouter();
  const { language, setIsLoggedIn, setUserId, setUsername, setRole, setDisplayName, setWard } = useAppStore();
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
    <div className="flex flex-col h-full bg-pwa-bg px-5 pt-6">
      <button onClick={() => router.back()} className="mb-8 text-pwa-muted flex items-center gap-2">
        <ArrowLeft className="w-5 h-5" /> Back
      </button>

      <h1 className="text-3xl font-bold text-white mb-2">Login</h1>
      <p className="text-sm text-pwa-muted mb-8">Enter your credentials to continue</p>

      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <input
            type="text"
            placeholder="Username"
            value={usernameInput}
            onChange={(e) => setUsernameInput(e.target.value)}
            className="w-full p-4 rounded-xl bg-pwa-surface text-white placeholder-pwa-muted border-2 border-transparent focus:border-pwa-primary outline-none transition-colors"
            required
          />
        </div>
        <div>
          <input
            type="password"
            placeholder="Password"
            value={passwordInput}
            onChange={(e) => setPasswordInput(e.target.value)}
            className="w-full p-4 rounded-xl bg-pwa-surface text-white placeholder-pwa-muted border-2 border-transparent focus:border-pwa-primary outline-none transition-colors"
            required
          />
        </div>
        
        {error && <p className="text-red-500 text-sm">{error}</p>}

        <div className="pt-4">
          <button
            type="submit"
            disabled={isSubmitting || !usernameInput || !passwordInput}
            className="w-full py-4 rounded-xl bg-pwa-primary text-pwa-bg font-bold shadow-lg disabled:opacity-50 transition-opacity"
          >
            {isSubmitting ? 'Logging in...' : 'Login'}
          </button>
        </div>
      </form>
    </div>
  );
}
