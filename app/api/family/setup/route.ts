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

    if (authError || !user) {
      console.error("Auth error:", authError?.message || "No user found in session")
      return NextResponse.json({ error: "Authentication failed" }, { status: 401 })
    }

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
