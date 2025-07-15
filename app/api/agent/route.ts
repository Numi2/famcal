import { streamText } from 'ai'
import { openai } from '@ai-sdk/openai'
import * as tools from '@/lib/tools'
import { NextRequest } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { messages, familyId } = await req.json()

    if (!familyId) {
      return new Response(
        JSON.stringify({ error: 'Family ID is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Add familyId to the context for tools that need it
    const systemMessage = {
      role: 'system' as const,
      content: `You are a helpful AI assistant for a family calendar application. You can help users manage their family events, find free time slots, and answer questions about their schedule.

Key capabilities:
- Create, update, and delete calendar events
- Find free time slots for scheduling
- List events within date ranges
- Parse natural language time expressions
- Handle timezone conversions

When creating or updating events, always include the familyId: ${familyId}

Be conversational and helpful. If a user asks to schedule something, help them find a good time slot and create the event.`
    }

    const result = await streamText({
      model: openai('gpt-4o'),
      messages: [systemMessage, ...messages],
      tools,
      maxSteps: 5, // Allow the agent to chain multiple tool calls
      temperature: 0.7,
    })

    return result.toDataStreamResponse()
  } catch (error) {
    console.error('Agent route error:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
} 