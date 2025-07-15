import { createServerClient, type CookieOptions } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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
  const {
    data: { user },
    error
  } = await supabase.auth.getUser()

  // Log authentication state for debugging
  if (request.nextUrl.pathname.startsWith('/api/')) {
    console.log('Middleware - API route:', request.nextUrl.pathname)
    console.log('Middleware - User authenticated:', !!user)
    if (error) {
      console.error('Middleware - Auth error:', error.message)
    }
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
