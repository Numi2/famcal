import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth/auth-context'
import { supabase } from '@/lib/supabase/client'

export function useFamilyId() {
  const { user } = useAuth()
  const [familyId, setFamilyId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function getFamilyId() {
      if (!user) {
        setFamilyId(null)
        setLoading(false)
        return
      }

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('family_id')
          .eq('id', user.id)
          .single()

        if (error) {
          console.error('Error fetching family ID:', error)
          setFamilyId(null)
        } else {
          setFamilyId(data?.family_id || null)
        }
      } catch (error) {
        console.error('Error fetching family ID:', error)
        setFamilyId(null)
      } finally {
        setLoading(false)
      }
    }

    getFamilyId()
  }, [user])

  return { familyId, loading }
} 