# AI Agent Implementation

This document describes the AI agent functionality implemented for the Family Calendar application.

## Overview

The AI agent provides intelligent calendar management capabilities through natural language interaction. Users can ask the agent to schedule events, find free time slots, and manage their family calendar using conversational language.

## Architecture

### Tools Directory (`lib/tools/`)

The AI agent uses a set of strongly-typed tools defined in `lib/tools/calendar-db.ts`:

#### CRUD Operations
- `createEvent` - Create new calendar events
- `updateEvent` - Update existing events
- `cancelEvent` - Delete events
- `getEvent` - Retrieve single event by ID
- `listEvents` - List events within a date range

#### Availability Tools
- `freeBusy` - Get busy time ranges within a window
- `findFreeSlot` - Find free time slots of specified duration

#### Helper Tools
- `parseNaturalTime` - Convert natural language to ISO datetime
- `guessTimeZone` - Determine timezone from locale/IP
- `convertToUserZone` - Convert UTC to user timezone

### Agent Route (`app/api/agent/route.ts`)

The agent route handles:
- Message streaming with AI SDK 5
- Tool execution with max 5 steps
- Family ID context injection
- Error handling and validation

### Chat UI (`components/ai-assistant/chat-ui.tsx`)

The chat interface provides:
- Floating chat widget
- Quick action buttons
- Real-time message streaming
- Mobile-responsive design

## Usage Examples

### Scheduling Events
\`\`\`
User: "Schedule a dentist appointment for next Tuesday at 2pm"
Agent: [Uses parseNaturalTime → findFreeSlot → createEvent]
\`\`\`

### Finding Free Time
\`\`\`
User: "Find a 2-hour slot this week for a family activity"
Agent: [Uses findFreeSlot with family context]
\`\`\`

### Event Management
\`\`\`
User: "What events do we have today?"
Agent: [Uses listEvents with today's date range]
\`\`\`

## Integration

The AI agent is integrated into the main application:

1. **Family ID Hook** (`lib/hooks/use-family-id.ts`) - Retrieves user's family ID from profile
2. **Main Page Integration** - AI assistant appears when user is authenticated
3. **Database Integration** - All tools connect to Supabase family_events table

## Configuration

### Environment Variables
- `OPENAI_API_KEY` - Required for AI model access
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key

### Model Configuration
- Model: `gpt-4o`
- Max Steps: 5 (prevents infinite loops)
- Temperature: 0.7 (balanced creativity)

## Error Handling

- Zod validation for all tool parameters
- Try-catch blocks in tool execution
- Graceful error messages to users
- Console logging for debugging

## Future Enhancements

1. **Recurring Events** - Full RRULE support
2. **Conflict Detection** - Smart scheduling suggestions
3. **Multi-language Support** - Internationalization
4. **Voice Integration** - Speech-to-text capabilities
5. **Advanced Parsing** - More sophisticated natural language processing

## Testing

The implementation includes:
- Type safety with TypeScript
- Zod schema validation
- Error boundary handling
- Console logging for debugging

To test the agent:
1. Start the development server
2. Authenticate with a user account
3. Click the AI assistant button
4. Try natural language commands like "Schedule a meeting for tomorrow"
