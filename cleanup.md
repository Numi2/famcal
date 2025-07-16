# Backend Cleanup Tasks and Fixes

## Overview
This document outlines the cleanup tasks and fixes needed for the backend of the Lovy-tech Family Calendar project. The backend is built with Next.js App Router, Supabase for authentication and database, and AI integration using the Vercel AI SDK.

## Critical Issues to Fix

### 1. Environment Variable Type Safety
**Problem**: Using non-null assertions (!) without runtime checks
**Files**: `lib/supabase/server.ts`, `lib/supabase/client.ts`
**Fix**: Add runtime validation for environment variables (even though they're in Vercel)
```typescript
// Create lib/utils/env.ts
export function getEnvVar(key: string): string {
  const value = process.env[key]
  if (!value) {
    throw new Error(`Environment variable ${key} is not configured`)
  }
  return value
}

// Usage:
const supabaseUrl = getEnvVar('NEXT_PUBLIC_SUPABASE_URL')
const supabaseKey = getEnvVar('NEXT_PUBLIC_SUPABASE_ANON_KEY')
```

### 2. Error Handling Inconsistencies
**Problem**: Inconsistent error handling across API routes
**Files**: All files in `app/api/`
**Fix**: Create a centralized error handler
```typescript
// Create lib/utils/api-error-handler.ts
export class ApiError extends Error {
  constructor(public statusCode: number, message: string, public details?: any) {
    super(message)
  }
}

export function handleApiError(error: unknown) {
  console.error('[API Error]:', error)
  
  if (error instanceof ApiError) {
    return NextResponse.json(
      { error: error.message, details: error.details },
      { status: error.statusCode }
    )
  }
  
  return NextResponse.json(
    { error: 'Internal server error' },
    { status: 500 }
  )
}
```

### 3. TypeScript Type Safety Issues
**Problem**: Overuse of non-null assertions (!) throughout the codebase
**Files**: `lib/supabase/server.ts`, `lib/supabase/client.ts`, `lib/supabase/family-client.ts`
**Fix**: Use the proper type utilities and handle edge cases
```typescript
// Instead of: supabaseUrl!
// Use: getEnvVar('NEXT_PUBLIC_SUPABASE_URL')

// For optional values, use proper type guards:
if (!user) {
  throw new Error('User not authenticated')
}
```

### 4. Security: No Rate Limiting
**Problem**: API routes have no rate limiting
**Fix**: Implement rate limiting middleware
- Add rate limiting for public API endpoints
- Consider using `@vercel/kv` or `upstash` for rate limit storage

### 5. Security: Missing Input Validation
**Problem**: Limited input validation on API routes
**Files**: `app/api/family/setup/route.ts`, `app/api/agent/route.ts`
**Fix**: Add Zod schemas for request validation
```typescript
import { z } from 'zod'

const familySetupSchema = z.object({
  familyName: z.string().min(1).max(100),
  familyDescription: z.string().max(500).optional(),
  members: z.array(z.object({
    full_name: z.string().min(1).max(100),
    role: z.enum(['parent', 'child', 'caregiver']),
    age: z.number().min(0).max(150).optional(),
    // ... other fields
  })).min(1).max(20)
})
```

## API and Database Critical Issues

**⚠️ CRITICAL SECURITY VULNERABILITIES FOUND:**
1. **Authorization Bypass** - Any user can access any family's data by passing different familyId
2. **Client-Side Database Access** - Server tools use browser client, bypassing all security
3. **No Access Control Verification** - Routes trust client-provided IDs without validation

These vulnerabilities allow complete unauthorized access to all family data in the system.

### 1. No Authorization Checks in API Routes
**Problem**: API routes accept `familyId` from client without verifying user access
**Files**: `app/api/agent/route.ts`, `app/api/chat/route.ts`
**Security Risk**: HIGH - Users can access any family's data by passing different familyId
**Fix**: Verify user belongs to the family before processing requests
```typescript
// Add to API routes
const supabase = await createClient()
const { data: { user } } = await supabase.auth.getUser()

// Verify user has access to the family
const { data: member } = await supabase
  .from('family_members')
  .select('id')
  .eq('family_id', familyId)
  .eq('user_id', user.id)
  .single()

if (!member) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
}
```

### 2. Using Client-Side Supabase in Server Tools
**Problem**: AI tools use browser client instead of server client
**Files**: `lib/tools/calendar-db.ts`
**Security Risk**: HIGH - Bypasses Row Level Security and server-side auth
**Fix**: Pass server client to tools or move tools to server-side
```typescript
// Instead of: import { supabase } from '../supabase/client'
// Tools should receive server client from API route
export const createEvent = tool({
  // ... parameters
  async execute(args, { supabase }) {
    // Use the passed server client
  }
})
```

### 3. No Row Level Security (RLS) Verification
**Problem**: Code assumes RLS is configured but doesn't verify
**Risk**: If RLS is misconfigured, data leaks occur
**Fix**: Add explicit authorization checks in code as defense in depth
```typescript
// Always include user context in queries
const { data } = await supabase
  .from('family_events')
  .select('*')
  .eq('family_id', familyId)
  .in('family_id', usersFamilyIds) // Extra safety check
```

### 4. Missing Database Transaction Support
**Problem**: Multi-step operations aren't atomic
**Files**: `lib/services/user-onboarding.ts`
**Risk**: Partial data creation on failures
**Fix**: Use Supabase transactions or implement rollback logic
```typescript
// Example: Creating family with members should be atomic
try {
  const family = await createFamily(...)
  const members = await Promise.all(memberCreations)
  // If member creation fails, family exists without members
} catch (error) {
  // Need rollback logic
}
```

### 5. Inefficient Query Patterns
**Problem**: Multiple separate queries instead of joins
**Files**: `lib/supabase/family-client.ts`
**Performance Impact**: HIGH
**Fix**: Use Supabase's query builder effectively
```typescript
// Instead of multiple queries:
const family = await getFamilyById(id)
const members = await getFamilyMembers(id)
const events = await getFamilyEvents(id)

// Use a single query with joins:
const { data } = await supabase
  .from('families')
  .select(`
    *,
    family_members (*),
    family_events (*)
  `)
  .eq('id', familyId)
  .single()
```

### 6. No Data Validation at Database Layer
**Problem**: Trusting client data without validation
**Files**: All database operations
**Fix**: Add validation before database operations
```typescript
// Validate data shapes match database constraints
const validatedData = familyEventSchema.parse(inputData)
// Check business rules (e.g., end_time > start_time)
if (validatedData.end_time <= validatedData.start_time) {
  throw new Error('End time must be after start time')
}
```

### 7. Exposed Database Structure in API Responses
**Problem**: Returning raw database rows to client
**Security Risk**: MEDIUM - Exposes internal structure
**Fix**: Use DTOs and response mapping
```typescript
// Create response DTOs
interface FamilyEventResponse {
  id: number
  title: string
  startTime: string
  // ... only fields client needs
}

// Map database rows to DTOs
const mapEventToResponse = (event: FamilyEvent): FamilyEventResponse => ({
  id: event.id,
  title: event.title,
  startTime: event.start_time,
  // ... mapped fields
})
```

### 8. No Pagination on List Queries
**Problem**: Fetching all records without limits
**Files**: `getFamilyEvents`, `getFamilyMembers`, etc.
**Risk**: Performance degradation with large datasets
**Fix**: Implement pagination
```typescript
async getFamilyEvents(familyId: string, options?: {
  page?: number
  limit?: number
  day?: number
}) {
  const limit = options?.limit || 50
  const offset = ((options?.page || 1) - 1) * limit
  
  const query = supabase
    .from('family_events')
    .select('*', { count: 'exact' })
    .eq('family_id', familyId)
    .range(offset, offset + limit - 1)
}
```

### 9. Missing Audit Trail
**Problem**: No tracking of who made changes
**Risk**: Can't trace unauthorized modifications
**Fix**: Add audit fields and triggers
```typescript
// Add to all modification operations
const auditData = {
  ...data,
  updated_by: user.id,
  updated_at: new Date().toISOString()
}
```

### 10. Hardcoded Supabase Table Names
**Problem**: Table names scattered throughout code
**Maintainability: LOW
**Fix**: Centralize table references
```typescript
// Create lib/db/tables.ts
export const TABLES = {
  FAMILIES: 'families',
  FAMILY_MEMBERS: 'family_members',
  FAMILY_EVENTS: 'family_events',
  // ...
} as const
```

### 11. Unsafe Tool Imports
**Problem**: Using wildcard imports for AI tools
**Files**: `app/api/agent/route.ts` - `import * as tools`
**Risk**: Exposes all exports, including helpers/internals
**Fix**: Use explicit imports
```typescript
// Instead of: import * as tools from '@/lib/tools'
import { 
  createEvent,
  updateEvent,
  deleteEvent,
  listEvents
  // ... only the tools you want to expose
} from '@/lib/tools'

// Create explicit tool registry
const availableTools = {
  createEvent,
  updateEvent,
  // ... controlled list
}
```

## Code Quality Improvements

### 1. Remove Duplicate Supabase Client Creation
**Problem**: Multiple ways to create Supabase clients
**Files**: `lib/supabase/client.ts`, `lib/supabase/family-client.ts`
**Fix**: Consolidate client creation and use dependency injection

### 2. Centralize Database Operations
**Problem**: Database operations scattered across different files
**Fix**: Create a proper repository pattern
```typescript
// Create lib/repositories/family-repository.ts
export class FamilyRepository {
  constructor(private client: SupabaseClient) {}
  
  async createFamily(data: CreateFamilyDTO) {
    // Implementation
  }
  
  // Other methods
}
```

### 3. Improve Tool Organization
**Problem**: AI tools defined inline in route handlers
**Files**: `app/api/chat/route.ts`
**Fix**: Move tools to separate files for better maintainability

### 4. Add Request Logging
**Problem**: Limited logging for debugging
**Fix**: Add structured logging
```typescript
// Create lib/utils/logger.ts
export const logger = {
  info: (message: string, meta?: any) => {
    console.log(JSON.stringify({ level: 'info', message, meta, timestamp: new Date() }))
  },
  error: (message: string, error?: any, meta?: any) => {
    console.error(JSON.stringify({ level: 'error', message, error, meta, timestamp: new Date() }))
  }
}
```

## Performance Optimizations

### 1. Add Caching Layer
**Problem**: No caching for frequently accessed data
**Fix**: Implement caching for:
- Family member data
- User profiles
- Calendar events

### 2. Optimize Database Queries
**Problem**: Potential N+1 queries in family data fetching
**Fix**: Use proper joins and batch queries

### 3. Implement Connection Pooling
**Problem**: Creating new Supabase clients for each request
**Fix**: Implement connection pooling for better performance

## Testing Requirements

### 1. Add Unit Tests
**Priority**: High
**Coverage needed for**:
- API route handlers
- Database operations
- Authentication middleware
- Input validation

### 2. Add Integration Tests
**Priority**: Medium
**Coverage needed for**:
- Full API flow testing
- Database transaction testing
- Authentication flow testing

### 3. Add E2E Tests
**Priority**: Low
**Coverage needed for**:
- Critical user journeys
- Family creation flow
- Calendar operations

## Documentation Tasks

### 1. API Documentation
- Document all API endpoints with request/response schemas
- Add OpenAPI/Swagger documentation
- Create API usage examples

### 2. Database Schema Documentation
- Document all tables and relationships
- Add migration documentation
- Create ER diagram

### 3. Environment Setup Guide
- Document all required environment variables
- Add local development setup guide
- Create deployment documentation

## Security Checklist

- [ ] Implement proper CORS configuration
- [ ] Add API rate limiting
- [ ] Implement request validation on all endpoints
- [ ] Add SQL injection prevention (Supabase handles this, but verify)
- [ ] Implement proper session management
- [ ] Add audit logging for sensitive operations
- [ ] Review and update dependencies for security vulnerabilities
- [ ] Implement proper error messages (don't leak sensitive info)

## Monitoring and Observability

### 1. Add Health Check Endpoint
```typescript
// app/api/health/route.ts
export async function GET() {
  try {
    // Check database connection
    const supabase = await createClient()
    const { error } = await supabase.from('families').select('count').limit(1)
    
    if (error) throw error
    
    return NextResponse.json({ status: 'healthy', timestamp: new Date() })
  } catch (error) {
    return NextResponse.json({ status: 'unhealthy', error: error.message }, { status: 503 })
  }
}
```

### 2. Add Performance Monitoring
- Integrate with monitoring service (e.g., Sentry, DataDog)
- Add custom metrics for API performance
- Track database query performance

## Refactoring Priorities

1. **CRITICAL Priority (Security)**:
   - Fix authorization bypass in API routes (familyId validation)
   - Replace client-side Supabase in server tools
   - Add user access verification for all family operations
   - Implement input validation with Zod schemas

2. **High Priority**:
   - Add runtime type safety for environment variables
   - Add proper error handling
   - Add rate limiting
   - Implement database transaction support
   - Add pagination to prevent DoS

3. **Medium Priority**:
   - Consolidate Supabase client creation
   - Implement repository pattern
   - Add logging
   - Add health checks

4. **Low Priority**:
   - Add caching
   - Optimize queries
   - Add comprehensive testing
   - Complete documentation

## What's Working Well

Despite the issues, some aspects are properly implemented:
- Database schema is well-structured with proper relationships
- TypeScript types are generated from database schema
- Basic authentication flow through Supabase Auth
- Middleware properly refreshes session cookies
- Good separation of concerns in file structure

## Next Steps

1. **IMMEDIATE**: Fix critical security vulnerabilities (authorization bypass)
2. Start with remaining security fixes
3. Implement proper error handling and validation
4. Add basic monitoring and health checks
5. Refactor code organization
6. Add testing coverage
7. Complete documentation

## Estimated Timeline

- **Week 1**: CRITICAL security fixes (authorization bypass, server-side tools, input validation)
- **Week 2**: High priority fixes (error handling, rate limiting, transactions)
- **Week 3**: Code organization and refactoring
- **Week 4**: Testing implementation and documentation