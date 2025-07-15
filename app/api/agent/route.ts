// app/api/agent/route.ts
import { openai } from '@ai-sdk/openai';
import { convertToModelMessages, streamText, UIMessage } from 'ai';
import * as calTools from '@/tools';   // re-exported tools
import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  const result = await streamText({
    model: openai('gpt-4o'),             // pick your model
    messages: convertToModelMessages(messages),
    tools: calTools,                     // 🛠 all calendar tools
    maxSteps: 4                          // let the model loop a few times
  });

  return result.toUIMessageStreamResponse();
}