import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { UserOnboardingService } from '@/lib/services/user-onboarding'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError) {
      console.error('Auth error:', authError)
      return NextResponse.json({ error: 'Authentication failed' }, { status: 401 })
    }
    
    if (!user) {
      console.error('No user found in session')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { familyName, familyDescription, members } = body

    // Create the family for the user, passing the server client
    const family = await UserOnboardingService.createFamilyForUser(
      user.id, 
      {
        familyName,
        familyDescription,
        members
      },
      supabase // Pass the server client
    )

    return NextResponse.json({ 
      success: true, 
      family,
      message: 'Family created successfully' 
    })

  } catch (error) {
    console.error('Error setting up family:', error)
    return NextResponse.json(
      { error: 'Failed to create family' }, 
      { status: 500 }
    )
  }
} 