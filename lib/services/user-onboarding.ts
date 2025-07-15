import { familyDb } from '@/lib/supabase/family-client'
import { supabase } from '@/lib/supabase/client'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/types'

export interface OnboardingData {
  familyName: string
  familyDescription?: string
  members: {
    full_name: string
    role: 'parent' | 'child' | 'caregiver'
    age?: number
    grade?: string
    school?: string
    allergies?: string[]
    color?: string
  }[]
}

export class UserOnboardingService {
  static async createFamilyForUser(
    userId: string, 
    onboardingData: OnboardingData,
    supabaseClient?: SupabaseClient<Database>
  ) {
    try {
      // Use provided client or default to regular client
      const client = supabaseClient || supabase
      
      // Create the family
      const family = await familyDb.createFamily(
        onboardingData.familyName,
        onboardingData.familyDescription,
        client
      )

      // Create family members
      const memberPromises = onboardingData.members.map(member => 
        familyDb.createFamilyMember(family.id, {
          ...member,
          user_id: member.role === 'parent' ? userId : undefined
        }, client)
      )

      await Promise.all(memberPromises)

      // Update the user's profile with the family ID
      const { error: profileError } = await client
        .from('profiles')
        .upsert({
          id: userId,
          family_id: family.id,
          updated_at: new Date().toISOString()
        })

      if (profileError) {
        throw profileError
      }

      return family
    } catch (error) {
      console.error('Error creating family for user:', error)
      throw error
    }
  }

  static async checkUserOnboardingStatus(userId: string, supabaseClient?: SupabaseClient<Database>) {
    try {
      const client = supabaseClient || supabase
      
      const { data: profile, error } = await client
        .from('profiles')
        .select('family_id')
        .eq('id', userId)
        .single()

      if (error) {
        throw error
      }

      return {
        hasFamily: !!profile?.family_id,
        familyId: profile?.family_id || null
      }
    } catch (error) {
      console.error('Error checking onboarding status:', error)
      return {
        hasFamily: false,
        familyId: null
      }
    }
  }

  static async createDefaultFamilyForUser(
    userId: string, 
    userEmail: string, 
    userName: string,
    supabaseClient?: SupabaseClient<Database>
  ) {
    const defaultOnboardingData: OnboardingData = {
      familyName: `${userName}'s Family`,
      familyDescription: 'Welcome to your family calendar!',
      members: [
        {
          full_name: userName,
          role: 'parent',
          color: 'bg-blue-500'
        }
      ]
    }

    return this.createFamilyForUser(userId, defaultOnboardingData, supabaseClient)
  }
}
