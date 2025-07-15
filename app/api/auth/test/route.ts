import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import type { Database } from "@/lib/supabase/types"

export async function GET(request: NextRequest) {
  try {
    // Log all incoming cookies for debugging
    const cookies = request.cookies.getAll()
    console.log("Auth Test - All cookies:", cookies.map(c => ({ 
      name: c.name, 
      hasValue: !!c.value,
      valueLength: c.value?.length || 0 
    })))

    // Validate environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json({
        error: "Missing environment variables",
        details: { hasUrl: !!supabaseUrl, hasKey: !!supabaseAnonKey }
      }, { status: 500 })
    }

    // Create Supabase client
    const supabase = createServerClient<Database>(
      supabaseUrl,
      supabaseAnonKey,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            // Just log what would be set, don't actually set
            console.log("Auth Test - Would set cookies:", cookiesToSet.length)
          },
        },
      },
    )

    // Test session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    console.log("Auth Test - Session:", {
      hasSession: !!session,
      sessionError: sessionError?.message || null,
      expiresAt: session?.expires_at || null
    })

    // Test user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    console.log("Auth Test - User:", {
      hasUser: !!user,
      userError: userError?.message || null,
      userId: user?.id || null
    })

    return NextResponse.json({
      cookies: cookies.length,
      session: {
        exists: !!session,
        error: sessionError?.message || null,
        expiresAt: session?.expires_at || null
      },
      user: {
        exists: !!user,
        error: userError?.message || null,
        id: user?.id || null,
        email: user?.email || null
      },
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error("Auth Test - Error:", error)
    return NextResponse.json({
      error: "Test failed",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}