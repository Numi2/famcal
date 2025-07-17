import { NextResponse } from 'next/server'

// Custom API error class
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public details?: any
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

// Handle API errors consistently
export function handleApiError(error: unknown): NextResponse {
  console.error('[API Error]:', error)

  if (error instanceof ApiError) {
    return NextResponse.json(
      { 
        error: error.message, 
        ...(process.env.NODE_ENV === 'development' && { details: error.details })
      },
      { status: error.statusCode }
    )
  }

  if (error instanceof Error) {
    // Don't expose internal error messages in production
    const message = process.env.NODE_ENV === 'development' 
      ? error.message 
      : 'An unexpected error occurred'
      
    return NextResponse.json(
      { error: message },
      { status: 500 }
    )
  }

  return NextResponse.json(
    { error: 'An unexpected error occurred' },
    { status: 500 }
  )
}

// Async handler wrapper for consistent error handling
export function withErrorHandler<T extends (...args: any[]) => Promise<any>>(
  handler: T
): T {
  return (async (...args) => {
    try {
      return await handler(...args)
    } catch (error) {
      return handleApiError(error)
    }
  }) as T
}