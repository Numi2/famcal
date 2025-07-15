import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import type { Database } from "@/lib/supabase/types"

export async function POST(request: NextRequest) {
  const debugInfo: any = {
    timestamp: new Date().toISOString(),
    steps: []
  }

  try {
    // Step 1: Check cookies
    const cookies = request.cookies.getAll()
    debugInfo.steps.push({
      step: "cookies_check",
      cookiesCount: cookies.length,
      authCookies: cookies.filter(c => c.name.includes('auth')).map(c => ({
        name: c.name,
        hasValue: !!c.value,
        valueLength: c.value?.length || 0
      }))
    })

    // Step 2: Validate environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    debugInfo.steps.push({
      step: "env_check",
      hasUrl: !!supabaseUrl,
      hasKey: !!supabaseAnonKey
    })
    
    if (!supabaseUrl || !supabaseAnonKey) {
      debugInfo.steps.push({
        step: "env_error",
        error: "Missing environment variables"
      })
      
      return NextResponse.json({
        error: "Server configuration error",
        debug: debugInfo
      }, { status: 500 })
    }

    // Step 3: Create Supabase client
    const supabase = createServerClient<Database>(
      supabaseUrl,
      supabaseAnonKey,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            debugInfo.steps.push({
              step: "supabase_set_cookies",
              cookiesToSet: cookiesToSet.length
            })
          },
        },
      },
    )

    debugInfo.steps.push({
      step: "supabase_client_created",
      success: true
    })

    // Step 4: Test session first
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    debugInfo.steps.push({
      step: "get_session",
      hasSession: !!session,
      sessionError: sessionError?.message || null,
      expiresAt: session?.expires_at || null
    })

    // Step 5: Test user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    debugInfo.steps.push({
      step: "get_user",
      hasUser: !!user,
      userError: userError?.message || null,
      userId: user?.id || null
    })

    // Step 6: Check if we can proceed
    if (userError) {
      debugInfo.steps.push({
        step: "auth_failed",
        error: userError,
        errorType: typeof userError,
        errorName: userError.name,
        errorMessage: userError.message,
        errorStatus: (userError as any).status
      })
      
      return NextResponse.json({
        error: "Authentication failed",
        debug: debugInfo
      }, { status: 401 })
    }

    if (!user) {
      debugInfo.steps.push({
        step: "no_user",
        message: "User is null despite no error"
      })
      
      return NextResponse.json({
        error: "No user found",
        debug: debugInfo
      }, { status: 401 })
    }

    // Step 7: Success
    debugInfo.steps.push({
      step: "success",
      userId: user.id,
      userEmail: user.email
    })

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email
      },
      debug: debugInfo
    })

  } catch (error) {
    debugInfo.steps.push({
      step: "unexpected_error",
      error: error instanceof Error ? error.message : "Unknown error",
      errorType: typeof error,
      errorName: error instanceof Error ? error.name : "Unknown"
    })

    return NextResponse.json({
      error: "Unexpected error",
      debug: debugInfo
    }, { status: 500 })
  }
}