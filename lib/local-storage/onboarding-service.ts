import { localStorageService } from './storage-service'

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

export class LocalOnboardingService {
  static async createFamilyForUser(
    userId: string, 
    onboardingData: OnboardingData
  ) {
    try {
      // Create the family
      const family = await localStorageService.createFamily(
        onboardingData.familyName,
        onboardingData.familyDescription
      )
      
      // Add members to the family
      for (const memberData of onboardingData.members) {
        await localStorageService.createFamilyMember({
          family_id: family.id,
          name: memberData.full_name,
          role: memberData.role as 'parent' | 'child',
          color: memberData.color
        })
      }
      
      return { family, success: true }
    } catch (error) {
      console.error('Error creating family:', error)
      throw error
    }
  }
  
  static async createDefaultFamilyForUser(
    userId: string,
    email: string,
    familyName: string
  ) {
    try {
      const family = await localStorageService.createFamily(
        familyName,
        'Welcome to your family calendar!'
      )
      
      // Only add the current user as a member with their email
      const userName = email.split('@')[0] || 'User'
      
      await localStorageService.createFamilyMember({
        family_id: family.id,
        name: userName,
        email: email,
        role: 'parent',
        color: '#3b82f6'
      })
      
      return { family, success: true }
    } catch (error) {
      console.error('Error creating default family:', error)
      throw error
    }
  }
}