# Family Calendar - Production Enhancement Tasks

## Overview
This document outlines the tasks needed to enhance the Family Calendar application for production deployment. The tasks are organized by priority and category to ensure a smooth transition from development to production.

## 🚀 High Priority Tasks


Below is a practical catalogue of the tools your Calendar-AI agent should expose, plus design patterns, type signatures, and code snippets that plug straight into AI-SDK 5’s strongly-typed tool-calling system.  Treat it as a menu: start with the CRUD core, add availability tools when you need scheduling super-powers, and sprinkle in helper utilities if you want the model to handle fuzzy user phrasing.

⸻

Quick overview

Purpose	Tool name	Minimum parameters (Zod)	Typical return
Create / edit	createEvent, updateEvent	summary, startsAt, endsAt, optional rrule, tzid	the new/updated Event row
Delete	cancelEvent	eventId	{ success: true }
Fetch	getEvent, listEvents	eventId or { from, to }	one Event or an array
Availability	findFreeSlot, freeBusy	{ durationMins, windowStart, windowEnd }	{ start, end } or list of busy ranges
Natural-time helpers (optional)	parseNaturalTime, guessTimeZone	English phrase or IP address	ISO-8601 string / IANA TZ

All of them follow AI-SDK 5’s “description / parameters / execute()” pattern, so the agent can call them in multi-step loops controlled by maxSteps. ￼ ￼

⸻

1  CRUD tools

1.1  createEvent

export const createEvent = tool({
  description: 'Create a calendar event in the local DB',
  parameters: z.object({
    summary:   z.string(),
    startsAt:  z.string().datetime(),  // ISO-8601 UTC
    endsAt:    z.string().datetime(),
    rrule:     z.string().optional(),  // RFC 5545
    tzid:      z.string().optional()   // IANA zone for display
  }),
  async execute(args) {
    const ruleId = args.rrule
      ? (await db.rule.create({ data: { rrule: args.rrule, tzid: args.tzid } })).id
      : undefined;
    return db.event.create({ data: { ...args, ruleId } });
  }
});

Store datetimes in UTC (TIMESTAMPTZ) and keep the user’s zone only for presentation—Postgres converts automatically on read. ￼ ￼
Recurring events stay lean by persisting the raw RRULE string rather than every instance. ￼

1.2  updateEvent and cancelEvent

Both tools accept an eventId.
updateEvent can reuse the same parameter schema as createEvent but mark everything optional.
cancelEvent should mark any future recurrences as exceptions instead of dropping the parent rule entirely, mirroring the iCalendar EXDATE concept. ￼

⸻

2  Query tools

2.1  getEvent

Returns a single expanded occurrence (respecting overrides) so the model can answer questions like “When exactly is my dentist appointment?”
It’s essentially a SELECT … WHERE id = $1.

2.2  listEvents

parameters: z.object({
  from: z.string().datetime(),
  to:   z.string().datetime()
})

Expand RRULEs inside [from, to] with rrule.js and merge in single-shot events and exceptions. ￼ ￼

⸻

3  Availability tools

3.1  freeBusy

parameters: z.object({
  windowStart: z.string().datetime(),
  windowEnd:   z.string().datetime()
})

Use a tstzrange GiST index and Postgres’s overlap operator && for an efficient query:

SELECT during FROM "Event"
WHERE during && tstzrange($1::timestamptz, $2::timestamptz);

This yields every busy slot in one pass. ￼ ￼

3.2  findFreeSlot

parameters: z.object({
  durationMins: z.number().int().positive(),
  windowStart:  z.string().datetime(),
  windowEnd:    z.string().datetime()
})

Internally calls freeBusy, subtracts busy ranges from the window, and returns the first gap ≥ durationMins.  The agent often uses this in a two-step loop: call the tool, then confirm with the user.  maxSteps ensures it never spirals. ￼ ￼

⸻

4  Helper tools (nice-to-haves)
	•	parseNaturalTime – leverage the model less: parse “next Friday after lunch” to an ISO string server-side.
	•	guessTimeZone – map IP or locale to an IANA TZ with a GeoIP service.
	•	convertToUserZone – small wrapper that transforms UTC → user TZ with the Temporal polyfill (Temporal.ZonedDateTime). ￼

Because they hide tricky date math, the LLM spends fewer tokens reasoning and fewer calls fail validation.

⸻

5  Testing & validation
	•	Schema validation – Zod catches bad args before they hit the DB. ￼
	•	Unit tests – Feed fixed prompts into generateText() (single-step) to assert the correct tool JSON.
	•	Integration tests – Spin up a test Postgres, seed fixtures, stream chat via streamText(), and verify side-effects.  AI-SDK exposes deterministic options so snapshots stay stable. ￼

⸻

6  Putting it all together in AI-SDK 5

import * as tools from '@/tools/calendar-db';

const result = await streamText({
  model: openai('gpt-4o'),
  messages: convertToModelMessages(uiMessages),
  tools,          // 🌟 every tool described above
  maxSteps: 5     // agent can chain calls & confirmations
});

Each tool becomes a tool-{name} part in the message stream; AI-SDK validates parameters, executes your code, injects the result, and lets the model decide what to do next—ask follow-ups, try another tool, or finish. ￼ ￼

⸻

Bottom line

Define a clean, purpose-built tool set—CRUD + availability + optional helpers—wrap every call in Zod, back it with your Postgres event store, and AI-SDK 5 will orchestrate multi-step reasoning for you.  The agent’s logic stays tiny while your database and tools do the heavy lifting.  


## 🏁 Definition of Done

Each task is considered complete when:
- [ ] Code is reviewed and approved
- [ ] Tests are written and passing
- [ ] Documentation is updated
- [ ] Feature is deployed to staging
- [ ] Stakeholder approval is obtained
- [ ] Monitoring is configured
- [ ] Performance metrics are met

---

*This document should be updated regularly as tasks are completed and new requirements emerge.*
