"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth/auth-context"
import { supabase } from "@/lib/supabase/client"

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
        setLoading(true)

        // First try to get family_id from profiles table
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("family_id")
          .eq("id", user.id)
          .single()

        if (!profileError && profile?.family_id) {
          setFamilyId(profile.family_id)
          setLoading(false)
          return
        }

        // If profiles query fails or no family_id, try family_members table
        const { data: memberData, error: memberError } = await supabase
          .from("family_members")
          .select("family_id")
          .eq("user_id", user.id)
          .single()

        if (!memberError && memberData?.family_id) {
          setFamilyId(memberData.family_id)

          // Update the profile with the family_id for future queries
          await supabase.from("profiles").upsert({
            id: user.id,
            family_id: memberData.family_id,
            updated_at: new Date().toISOString(),
          })
        } else {
          // User is not part of any family
          setFamilyId(null)
        }
      } catch (error) {
        console.error("Error fetching family ID:", error)
        setFamilyId(null)
      } finally {
        setLoading(false)
      }
    }

    getFamilyId()
  }, [user])

  return { familyId, loading }
}
