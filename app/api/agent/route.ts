import { streamText } from 'ai'
import { openai } from '@ai-sdk/openai'
import { NextRequest } from 'next/server'
import { getAuthenticatedUser } from '@/lib/auth/server'
import { createSecureDbClient } from '@/lib/db/client'
import { createServerTools } from '@/lib/tools/server-tools'
import { withErrorHandler, ApiError } from '@/lib/utils/errors'
import { z } from 'zod'

// Validation schema for agent requests
const agentRequestSchema = z.object({
  messages: z.array(z.object({
    role: z.enum(['user', 'assistant', 'system']),
    content: z.string()
  })),
  familyId: z.string().uuid()
})

export const POST = withErrorHandler(async (req: NextRequest) => {
  const user = await getAuthenticatedUser()
  const body = await req.json()
  
  // Validate request
  const { messages, familyId } = agentRequestSchema.parse(body)
  
  // Create secure database client
  const db = await createSecureDbClient(user.id)
  
  // Verify user has access to the family (this will throw if not)
  await db.getFamilyMembers(familyId)
  
  // Create tools with proper security context
  const tools = createServerTools(db, user.id, familyId)
  
  // System message with context
  const systemMessage = {
    role: 'system' as const,
    content: `You are a helpful AI assistant for a family calendar application. 
You help families manage their daily lives through three types of events:

1. CHORES - Household tasks and responsibilities
   - Can be assigned to family members
   - Can have point values for rewards
   - Can be marked as completed
   - Can be recurring

2. MEALS - Meal planning and preparation
   - Breakfast, lunch, dinner, or snack
   - Can include prep time and servings
   - Helps with meal planning and grocery lists

3. ACTIVITIES - Family events and appointments
   - Has start and end times
   - Can include location and cost
   - For appointments, school events, sports, etc.

Current context:
- You are helping the authenticated user manage their family's calendar
- All operations are automatically secured to only their family's data
- The current date/time is: ${new Date().toLocaleString()}

Be conversational and helpful. When creating events:
- Ask for any missing required information
- Suggest appropriate family members for assignments
- Help find good time slots for activities
- Provide helpful reminders about upcoming events`
  }

  const result = await streamText({
    model: openai('gpt-4o'),
    messages: [systemMessage, ...messages],
    tools,
    maxSteps: 5,
    temperature: 0.7,
  })

  return result.toDataStreamResponse()
})
