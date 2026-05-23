import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

// Create client only if environment variables are provided to avoid throwing startup errors
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

if (!isSupabaseConfigured) {
  console.log(
    '%c[Sentinel Database Alert]%c Running in dynamic Demo Simulation Mode. Define NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in a .env.local file to connect to a live Supabase server.',
    'color: #00F0FF; font-weight: bold;',
    'color: #8A99AD;'
  )
}
