import { createClient } from '@/lib/supabase/server'
import { ApiError } from '@/lib/utils/errors'

export async function getAuthenticatedUser() {
  const supabase = await createClient()
  
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    throw new ApiError(401, 'Authentication required')
  }
  
  return user
}

export async function getUserWithProfile() {
  const user = await getAuthenticatedUser()
  const supabase = await createClient()
  
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()
    
  if (error || !profile) {
    throw new ApiError(500, 'Failed to fetch user profile')
  }
  
  return { user, profile }
}