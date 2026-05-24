import { supabaseClient } from './supabase/client';

export interface AdminSession {
  id: string;
  email: string;
  name: string;
  role: string;
  title: string;
  image?: string;
}

export const validateAdminRole = (role?: string) => {
  if (!role) return false;
  const normalized = role.toLowerCase();
  return ['admin', 'cho', 'dho'].includes(normalized);
};

export const getCurrentAdmin = async (): Promise<AdminSession | null> => {
  const { data: { session }, error } = await supabaseClient.auth.getSession();
  
  if (error || !session?.user) {
    return null;
  }

  const { user } = session;
  const role = user?.user_metadata?.role;
  
  if (!validateAdminRole(role)) {
    return null;
  }

  return {
    id: user.id,
    email: user.email || '',
    name: user.user_metadata?.name || 'Bhogadi PHC Control Desk',
    title: user.user_metadata?.title || 'Community Health Officer',
    role: role,
    image: user.user_metadata?.image || ''
  };
};

export const loginAdmin = async (email: string, password: string): Promise<{ success: boolean; error?: string; session?: any; user?: any }> => {
  const { data, error } = await supabaseClient.auth.signInWithPassword({
    email,
    password,
  });

  console.log("LOGIN ERROR:", error);
  console.log("SESSION:", data?.session);
  console.log("ROLE:", data?.user?.user_metadata?.role);

  if (error) {
    return { success: false, error: 'Invalid credentials or unauthorized PHC access.' };
  }

  if (data.user) {
    const role = data.user.user_metadata?.role;
    if (!validateAdminRole(role)) {
      await supabaseClient.auth.signOut();
      return { success: false, error: 'Invalid credentials or unauthorized PHC access.' };
    }
  }

  return { success: true, session: data.session, user: data.user };
};

export const logoutAdmin = async () => {
  await supabaseClient.auth.signOut();
};
