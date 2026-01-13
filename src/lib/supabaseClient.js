import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Fungsi validasi URL sederhana
const isUrlValid = (string) => {
  try {
    new URL(string)
    return true
  } catch (_) {
    return false
  }
}

let supabaseInstance

if (supabaseUrl && isUrlValid(supabaseUrl) && supabaseAnonKey) {
  supabaseInstance = createClient(supabaseUrl, supabaseAnonKey)
} else {
  console.warn('⚠️ Supabase credentials are missing or invalid. Check your .env file.')
  // Mock object agar AuthContext tidak crash saat memanggil metode supabase
  supabaseInstance = {
    auth: {
      getSession: async () => ({ data: { session: null }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      signInWithPassword: async () => ({ error: { message: 'Supabase not configured' } }),
      signUp: async () => ({ error: { message: 'Supabase not configured' } }),
      signOut: async () => ({ error: null }),
    }
  }
}

export const supabase = supabaseInstance