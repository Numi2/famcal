import { type NextRequest, NextResponse } from "next/server"
import { getAuthenticatedUser, createServerSupabaseClient } from "@/lib/supabase/server-helpers"
import { UserOnboardingService } from "@/lib/services/user-onboarding"

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user with improved error handling
    const { user, error: authError } = await getAuthenticatedUser()

    if (authError) {
      console.error("Authentication error in family setup:", authError)
      return NextResponse.json(
        { 
          error: "Authentication failed", 
          details: authError.message,
          hint: "Please ensure you are logged in and try again"
        }, 
        { status: 401 }
      )
    }

    if (!user) {
      return NextResponse.json(
        { 
          error: "Unauthorized", 
          details: "No authenticated user found",
          hint: "Please log in and try again"
        }, 
        { status: 401 }
      )
    }

    console.log("User authenticated successfully:", user.id)
    
    // Create a fresh Supabase client for the operation
    const supabase = await createServerSupabaseClient()

    const body = await request.json()
    const { familyName, familyDescription, members } = body

    if (!familyName || !members || !Array.isArray(members) || members.length === 0) {
      return NextResponse.json(
        { error: "Missing required fields: familyName and members are required." },
        { status: 400 },
      )
    }

    // Create the family for the user, passing the server client
    const family = await UserOnboardingService.createFamilyForUser(
      user.id,
      {
        familyName,
        familyDescription,
        members,
      },
      supabase,
    )

    return NextResponse.json({
      success: true,
      family,
      message: "Family created successfully",
    })
  } catch (error) {
    console.error("Error setting up family:", error)
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred."
    return NextResponse.json({ error: `Failed to create family: ${errorMessage}` }, { status: 500 })
  }
}
