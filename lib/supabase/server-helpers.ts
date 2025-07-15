import { createServerClient, type CookieOptions } from "@supabase/ssr"
import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import type { Database } from "./types"

/**
 * Create a Supabase client for server-side operations with better cookie handling
 */
export async function createServerSupabaseClient() {
  const cookieStore = await cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set({ name, value, ...options })
            })
          } catch (error) {
            // This error occurs when trying to set cookies in a Server Component
            // It can be safely ignored as the middleware will handle session refresh
            console.warn('Unable to set cookies in Server Component context')
          }
        },
      },
    },
  )
}

/**
 * Create a Supabase client for API routes with proper response handling
 */
export function createRouteHandlerClient(
  request: NextRequest,
  response: NextResponse
) {
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set({ name, value, ...options })
            response.cookies.set({ name, value, ...options })
          })
        },
      },
    },
  )
}

/**
 * Get authenticated user from request with better error handling
 */
export async function getAuthenticatedUser() {
  const supabase = await createServerSupabaseClient()
  
  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error) {
      console.error("Auth error in getAuthenticatedUser:", error)
      return { user: null, error }
    }

    if (!user) {
      return { 
        user: null, 
        error: new Error("No authenticated user found") 
      }
    }

    return { user, error: null }
  } catch (error) {
    console.error("Unexpected error in getAuthenticatedUser:", error)
    return { 
      user: null, 
      error: error instanceof Error ? error : new Error("Authentication failed") 
    }
  }
}