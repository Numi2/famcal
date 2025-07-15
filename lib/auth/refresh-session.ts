import { supabase } from "@/lib/supabase/client"

export async function refreshSession() {
  try {
    const { data: { session }, error } = await supabase.auth.refreshSession()
    
    if (error) {
      console.error("Failed to refresh session:", error)
      return false
    }
    
    return !!session
  } catch (error) {
    console.error("Error refreshing session:", error)
    return false
  }
}

export async function ensureAuthenticated() {
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    console.error("No active session found")
    return false
  }
  
  // Check if the session needs refreshing (expired or close to expiry)
  const expiresAt = new Date(session.expires_at! * 1000)
  const now = new Date()
  const timeUntilExpiry = expiresAt.getTime() - now.getTime()
  
  // Refresh if less than 5 minutes until expiry
  if (timeUntilExpiry < 5 * 60 * 1000) {
    console.log("Session close to expiry, refreshing...")
    return await refreshSession()
  }
  
  return true
}