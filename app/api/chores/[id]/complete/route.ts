import { NextRequest } from 'next/server'
import { getAuthenticatedUser } from '@/lib/auth/server'
import { createSecureDbClient } from '@/lib/db/client'
import { withErrorHandler, ApiError } from '@/lib/utils/errors'

interface RouteParams {
  params: {
    id: string
  }
}

// POST /api/chores/[id]/complete - Mark a chore as complete
export const POST = withErrorHandler(async (
  request: NextRequest,
  { params }: RouteParams
) => {
  const user = await getAuthenticatedUser()
  const db = await createSecureDbClient(user.id)
  
  const eventId = params.id
  
  if (!eventId) {
    throw new ApiError(400, 'Chore ID is required')
  }
  
  const event = await db.completeChore(eventId)
  
  return Response.json(event)
})