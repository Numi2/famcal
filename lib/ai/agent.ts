import { openai } from '@ai-sdk/openai';
import { streamText, CoreMessage, tool } from 'ai';
import { z } from 'zod';
import { CalendarActions } from './actions/calendar-actions';
import { FamilyActions } from './actions/family-actions';
import { IntentRecognizer } from './intents';
import { AIContext } from './context';
import { calendarTools } from './tools/calendar-tools';
import { familyTools } from './tools/family-tools';

export class FamilyCalendarAgent {
  private calendarActions: CalendarActions;
  private familyActions: FamilyActions;
  private intentRecognizer: IntentRecognizer;
  private context: AIContext;

  constructor(userId: string, familyId: string) {
    this.calendarActions = new CalendarActions(userId, familyId);
    this.familyActions = new FamilyActions(userId, familyId);
    this.intentRecognizer = new IntentRecognizer();
    this.context = new AIContext(userId, familyId);
  }

  async processMessage(messages: CoreMessage[]) {
    // Load user context
    await this.context.loadContext();

    const result = await streamText({
      model: openai('gpt-4-turbo-preview'),
      messages: [
        {
          role: 'system',
          content: this.getSystemPrompt()
        },
        ...messages
      ],
      tools: {
        ...calendarTools,
        ...familyTools,
      },
      maxTokens: 2000,
      temperature: 0.7,
    });

    return result;
  }

  private getSystemPrompt(): string {
    return `You are an AI assistant for a Family Calendar application.
Your purpose is to help families with small children manage their daily lives.

Context:
${this.context.getContextSummary()}

Guidelines:
1. Be friendly, helpful, and understanding of busy family life
2. Always confirm before making changes to the calendar
3. Consider all family members' schedules when suggesting times
4. Provide clear summaries of actions taken
5. Suggest alternatives when conflicts arise
6. Be proactive with helpful reminders and suggestions

Available capabilities:
- Create, update, and delete calendar events
- Check family member availability
- Suggest optimal times for activities
- Manage recurring events
- Handle scheduling conflicts
- Provide activity suggestions based on weather and preferences`;
  }

  async executeAction(actionType: string, parameters: any) {
    switch (actionType) {
      case 'createEvent':
        return await this.calendarActions.createEvent(parameters);
      case 'updateEvent':
        return await this.calendarActions.updateEvent(parameters);
      case 'deleteEvent':
        return await this.calendarActions.deleteEvent(parameters);
      case 'findAvailableSlot':
        return await this.calendarActions.findAvailableSlot(parameters);
      case 'updateFamilyMember':
        return await this.familyActions.updateMemberPreferences(parameters);
      default:
        throw new Error(`Unknown action type: ${actionType}`);
    }
  }
}