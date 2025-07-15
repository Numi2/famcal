# Voice-Controlled Calendar Assistant – Task List

Build a web app that lets a user press a **mic** button, speak a natural-language command (e.g. “Schedule a 30-minute meeting with Alex tomorrow at 3 PM”), and have the app automatically perform the requested action on their calendar.

---

## 1. Project Setup
- [ ] Create a new Vercel project / Git repository.
- [ ] Add a modern framework starter (Next.js / SvelteKit / Remix) – pick one.
- [ ] `pnpm add @vercel/ai` (or `npm/yarn`) – install Vercel AI SDK.
- [ ] Add linting + formatter (ESLint, Prettier) and Husky pre-commit hook.

## 2. Environment & Secrets
- [ ] Create **.env.local** with:
  - `OPENAI_API_KEY=` (or other model provider key)
  - `GOOGLE_CALENDAR_CLIENT_ID=`, `GOOGLE_CALENDAR_CLIENT_SECRET=`
  - Any refresh tokens / redirect URLs.
- [ ] Add environment variables to Vercel dashboard.

## 3. Audio Capture UI
- [ ] Add a floating "🔴 Mic" button component.
- [ ] Use **MediaDevices.getUserMedia** to capture microphone input.
- [ ] Visual feedback (live waveform / glowing icon) while recording.
- [ ] Limit max recording length (e.g. 30 s) or stop on silence.

## 4. Speech-to-Text
- [ ] Pipe raw audio to **Whisper API** via Vercel AI SDK (Streaming if possible).
- [ ] Display interim transcription while recording.
- [ ] Handle STT errors & retry.

## 5. Intent & Entity Extraction
- [ ] Send the transcribed text to an LLM function call (`@vercel/ai` `messages` API).
- [ ] Prompt design: ask the model to output a predefined JSON schema:
  ```json
  {
    "action": "create|update|delete",
    "title": "string",
    "start": "ISO-8601",
    "end": "ISO-8601",
    "attendees": ["email@"],
    "location": "string",
    "notes": "string"
  }
  ```
- [ ] Validate the JSON with **zod** or similar.

## 6. Calendar Integration
- [ ] Add Google Calendar OAuth flow (PKCE or server-side exchange).
- [ ] Store & refresh access tokens (encrypted cookie / serverless KV).
- [ ] Implement helper functions: `createEvent`, `updateEvent`, `deleteEvent`.
- [ ] Map validated LLM output to Calendar API calls.
- [ ] Optimistic UI feedback (spinner → success toast).

## 7. Serverless Endpoints
- [ ] `/api/voice-to-action` → orchestrates STT → LLM → calendar mutation.
- [ ] Stream back progress events via **Server-Sent Events** for real-time UI.

## 8. Front-End State Handling
- [ ] Use React context or state machine (XState) for recording → transcribing → executing → done.
- [ ] Show friendly errors (“Couldn’t understand, please try again”).
- [ ] Render created/updated event in an inline calendar view.

## 9. Testing & QA
- [ ] Unit tests: prompt parser, calendar helpers.
- [ ] E2E tests with Cypress/Playwright: mock mic input & Calendar API.
- [ ] Accessibility audit – ensure mic button is keyboard accessible.

## 10. Deployment
- [ ] `vercel` – deploy preview.
- [ ] Verify environment variables are set in production.
- [ ] Add custom domain & HTTPS.

## 11. Future Enhancements
- [ ] Multi-language transcription.
- [ ] Support multiple calendar providers (Outlook, iCal).
- [ ] Contextual follow-up ("Move that meeting to Friday").
- [ ] Push notifications / email confirmations.

---

> **Tip:** Develop locally with **Vercel CLI** to emulate serverless functions & edge runtime.