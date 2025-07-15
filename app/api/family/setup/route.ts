import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { UserOnboardingService } from "@/lib/services/user-onboarding"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get the current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError) {
      console.error("Supabase auth error:", {
        message: authError.message,
        status: authError.status,
        details: authError
      })
      return NextResponse.json({ 
        error: "Authentication failed", 
        details: authError.message 
      }, { status: 401 })
    }

    if (!user) {
      console.error("No user found in session - potential session/cookie issue")
      return NextResponse.json({ 
        error: "No authenticated user found", 
        details: "Session may have expired or cookies are not being set properly" 
      }, { status: 401 })
    }

    console.log("User authenticated successfully:", user.id)

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
