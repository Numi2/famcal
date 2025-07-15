import { NextRequest, NextResponse } from 'next/server';
import { FamilyCalendarAgent } from '@/lib/ai/agent';
import { createClient } from '@/lib/supabase/server';
import { CoreMessage } from 'ai';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    // Get the request body
    const { messages, userId, familyId } = await req.json();

    // Validate required fields
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Messages array is required' },
        { status: 400 }
      );
    }

    // Get auth from Supabase if not provided
    let authenticatedUserId = userId;
    let authenticatedFamilyId = familyId;

    if (!authenticatedUserId || !authenticatedFamilyId) {
      const supabase = await createClient();
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        return NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        );
      }

      authenticatedUserId = user.id;
      
      // Get family ID from user profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('family_id')
        .eq('id', user.id)
        .single();
      
      if (profileError || !profile?.family_id) {
        return NextResponse.json(
          { error: 'No family associated with user' },
          { status: 400 }
        );
      }
      
      authenticatedFamilyId = profile.family_id;
    }

    // Create AI agent instance
    const agent = new FamilyCalendarAgent(authenticatedUserId, authenticatedFamilyId);

    // Process the message and get streaming response
    const result = await agent.processMessage(messages as CoreMessage[]);

    // Return the streaming response
    return result.toDataStreamResponse();

  } catch (error) {
    console.error('Chat API Error:', error);
    
    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes('rate limit')) {
        return NextResponse.json(
          { error: 'Too many requests. Please try again later.' },
          { status: 429 }
        );
      }
      
      if (error.message.includes('token limit')) {
        return NextResponse.json(
          { error: 'Message too long. Please shorten your request.' },
          { status: 400 }
        );
      }
    }

    // Generic error response
    return NextResponse.json(
      { error: 'An error occurred processing your request' },
      { status: 500 }
    );
  }
}