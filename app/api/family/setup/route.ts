import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { UserOnboardingService } from "@/lib/services/user-onboarding"
import type { Database } from "@/lib/supabase/types"

export async function POST(request: NextRequest) {
  // Create response object first
  let response = NextResponse.next()
  
  try {
    // Debug: Log incoming cookies
    const cookies = request.cookies.getAll()
    console.log("API Route - Incoming cookies:", cookies.map(c => ({ name: c.name, hasValue: !!c.value })))
    
    // Validate environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error("Missing Supabase environment variables:", { 
        hasUrl: !!supabaseUrl, 
        hasKey: !!supabaseAnonKey,
        nodeEnv: process.env.NODE_ENV
      })
      return NextResponse.json({
        error: "Server configuration error",
        details: "Missing required environment variables",
        hint: "Please check your Supabase environment variables"
      }, { status: 500 })
    }

    // Create Supabase client specifically for API routes
    const supabase = createServerClient<Database>(
      supabaseUrl,
      supabaseAnonKey,
      {
        cookies: {
          getAll() {
            const allCookies = request.cookies.getAll()
            console.log("Supabase client - getAll cookies:", allCookies.length)
            return allCookies
          },
          setAll(cookiesToSet) {
            console.log("Supabase client - setAll cookies:", cookiesToSet.length)
            cookiesToSet.forEach(({ name, value, options }) => {
              request.cookies.set({ name, value, ...options })
              response.cookies.set({ name, value, ...options })
            })
          },
        },
      },
    )

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError) {
      console.error("Supabase auth error in family setup:", {
        message: authError.message,
        status: authError.status,
        name: authError.name,
        cause: authError.cause
      })
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
      console.error("No user found in session during family setup")
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
