import { supabase } from '@/lib/supabase';
import { sha256 } from '@/lib/utils';

/**
 * Sign up a new user in the Supabase `users` table.
 * Returns the created user record (id, username, role, ward).
 */
export async function signupUser({
  username,
  password,
  role,
  ward,
}: {
  username: string;
  password: string;
  role: string;
  ward: string;
}) {
  const hashed = await sha256(password);
  const { data, error } = await supabase!
    .from('users')
    .insert({
      username,
      password: hashed, // store a hashed password
      role,
      ward,
    })
    .select('id, username, role, ward')
    .single();

  if (error) {
    throw error;
  }
  return data;
}

/**
 * Log in an existing user.
 * Returns the matching user record.
 */
export async function loginUser({
  username,
  password,
}: {
  username: string;
  password: string;
}) {
  const hashed = await sha256(password);
  const { data, error } = await supabase!
    .from('users')
    .select('id, username, role, ward')
    .eq('username', username)
    .eq('password', hashed)
    .single();

  if (error) {
    throw error;
  }
  return data;
}
