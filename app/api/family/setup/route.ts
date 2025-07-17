import { type NextRequest } from "next/server"
import { getAuthenticatedUser } from "@/lib/auth/server"
import { createClient } from "@/lib/supabase/server"
import { UserOnboardingService } from "@/lib/services/user-onboarding"
import { withErrorHandler, ApiError } from "@/lib/utils/errors"
import { z } from "zod"

// Validation schema for family setup
const familySetupSchema = z.object({
  familyName: z.string().min(1).max(100),
  familyDescription: z.string().max(500).optional(),
  members: z.array(z.object({
    full_name: z.string().min(1).max(100),
    role: z.enum(['parent', 'child', 'caregiver']),
    age: z.number().min(0).max(150).optional(),
    grade: z.string().max(20).optional(),
    school: z.string().max(200).optional(),
    allergies: z.array(z.string()).optional(),
    color: z.string().optional()
  })).min(1).max(20)
})

export const POST = withErrorHandler(async (request: NextRequest) => {
  const user = await getAuthenticatedUser()
  const supabase = await createClient()
  
  const body = await request.json()
  
  // Validate request body
  const validatedData = familySetupSchema.parse(body)
  
  // Create the family for the user
  const family = await UserOnboardingService.createFamilyForUser(
    user.id,
    validatedData,
    supabase
  )

  return Response.json({
    success: true,
    family,
    message: "Family created successfully"
  })
})
