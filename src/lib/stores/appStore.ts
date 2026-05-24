import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Language } from '../i18n/translations';

interface AppState {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  // Authentication / session fields
  isLoggedIn: boolean;
  setIsLoggedIn: (status: boolean) => void;
  userId: string; // Supabase users.id
  setUserId: (id: string) => void;
  username: string; // unique username
  setUsername: (name: string) => void;
  role: string;
  setRole: (role: string) => void;
  displayName: string;
  setDisplayName: (name: string) => void;
  ward: string;
  setWard: (ward: string) => void;
  phone: string;
  setPhone: (phone: string) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      language: 'en',
      setLanguage: (lang) => set({ language: lang }),
      toggleLanguage: () => set((state) => ({ language: state.language === 'en' ? 'kn' : 'en' })),
      theme: 'light',
      setTheme: (theme) => set({ theme }),
      isLoggedIn: false,
      setIsLoggedIn: (status) => set({ isLoggedIn: status }),
      // New auth fields with default empty values
      userId: '',
      setUserId: (id: string) => set({ userId: id }),
      username: '',
      setUsername: (name: string) => set({ username: name }),
      // Existing profile fields
      role: '',
      setRole: (role) => set({ role }),
      displayName: '',
      setDisplayName: (name) => set({ displayName: name }),
      ward: '',
      setWard: (ward) => set({ ward }),
      phone: '',
      setPhone: (phone) => set({ phone }),
    }),
    {
      name: 'arogya-bandhu-storage',
    }
  )
);
