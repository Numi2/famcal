import { NextRequest } from 'next/server'
import { getAuthenticatedUser } from '@/lib/auth/server'
import { createSecureDbClient } from '@/lib/db/client'
import { withErrorHandler } from '@/lib/utils/errors'

interface RouteParams {
  params: {
    id: string
  }
}

// GET /api/families/[id]/members - Get family members
export const GET = withErrorHandler(async (
  request: NextRequest,
  { params }: RouteParams
) => {
  const user = await getAuthenticatedUser()
  const db = await createSecureDbClient(user.id)
  
  const familyId = params.id
  const members = await db.getFamilyMembers(familyId)
  
  return Response.json({ members })
})