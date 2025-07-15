import { createClient } from "@supabase/supabase-js"
import type { Database } from "./types"

// Create client lazily to avoid build-time environment variable issues
let _supabase: any = null

function getSupabaseClient() {
  if (!_supabase) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co"
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-key"

    _supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
      }
    })
  }
  return _supabase
}

// Create a properly configured client for client-side operations
export const supabase = getSupabaseClient()
