import { NextRequest } from 'next/server'
import { getAuthenticatedUser } from '@/lib/auth/server'
import { createSecureDbClient } from '@/lib/db/client'
import { eventSchema } from '@/lib/db/schema'
import { withErrorHandler, ApiError } from '@/lib/utils/errors'
import { z } from 'zod'

// GET /api/events - List events for a family
export const GET = withErrorHandler(async (request: NextRequest) => {
  const user = await getAuthenticatedUser()
  const db = await createSecureDbClient(user.id)
  
  const searchParams = request.nextUrl.searchParams
  const familyId = searchParams.get('familyId')
  
  if (!familyId) {
    throw new ApiError(400, 'familyId parameter is required')
  }
  
  // Parse query parameters
  const options = {
    type: searchParams.get('type') as any,
    startDate: searchParams.get('startDate') || undefined,
    endDate: searchParams.get('endDate') || undefined,
    assignedTo: searchParams.get('assignedTo') || undefined,
    limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined,
    offset: searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : undefined
  }
  
  const result = await db.getEvents(familyId, options)
  
  return NextResponse.json(result)
})

// POST /api/events - Create a new event
export const POST = withErrorHandler(async (request: NextRequest) => {
  const user = await getAuthenticatedUser()
  const db = await createSecureDbClient(user.id)
  
  const body = await request.json()
  
  // Add createdBy to the event data
  const eventData = {
    ...body,
    createdBy: user.id
  }
  
  // Validate the event data
  const validatedEvent = eventSchema.parse(eventData)
  
  const event = await db.createEvent(validatedEvent)
  
  return Response.json(event, { status: 201 })
})

// PATCH /api/events/[id] - Update an event
export const PATCH = withErrorHandler(async (request: NextRequest) => {
  const user = await getAuthenticatedUser()
  const db = await createSecureDbClient(user.id)
  
  const url = new URL(request.url)
  const pathParts = url.pathname.split('/')
  const eventId = pathParts[pathParts.length - 1]
  
  if (!eventId) {
    throw new ApiError(400, 'Event ID is required')
  }
  
  const updates = await request.json()
  
  const event = await db.updateEvent(eventId, updates)
  
  return Response.json(event)
})