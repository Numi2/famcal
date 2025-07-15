import { createServerClient, type CookieOptions } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Middleware - Missing Supabase environment variables")
    return response
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set({
              name,
              value,
              ...options,
            })
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set({
              name,
              value,
              ...options,
            })
          })
        },
      },
    },
  )

  // Refresh the session and handle authentication
  try {
    const {
      data: { user },
      error
    } = await supabase.auth.getUser()

    // Log authentication state for debugging API routes
    if (request.nextUrl.pathname.startsWith('/api/')) {
      console.log('Middleware - API route:', request.nextUrl.pathname)
      console.log('Middleware - Cookies count:', request.cookies.getAll().length)
      console.log('Middleware - User authenticated:', !!user)
      if (error) {
        console.error('Middleware - Auth error:', error.message)
      }
    }

    // If we have a user, ensure the session is properly refreshed
    if (user) {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        console.log('Middleware - Session refreshed successfully')
      }
    }
  } catch (error) {
    console.error('Middleware - Unexpected error:', error)
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
