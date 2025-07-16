# Backend Cleanup Tasks and Fixes

## Overview
This document outlines the cleanup tasks and fixes needed for the backend of the Lovy-tech Family Calendar project. The backend is built with Next.js App Router, Supabase for authentication and database, and AI integration using the Vercel AI SDK.

## Critical Issues to Fix

### 1. Environment Variable Validation
**Problem**: No validation for required environment variables
**Files**: `lib/supabase/server.ts`, `lib/supabase/client.ts`
**Fix**: Add environment variable validation on app startup
```typescript
// Create lib/utils/env-validation.ts
const requiredEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'OPENAI_API_KEY'
]

export function validateEnv() {
  const missing = requiredEnvVars.filter(key => !process.env[key])
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`)
  }
}
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

### 3. Missing TypeScript Types
**Problem**: Using non-null assertions (!) without proper type guards
**Files**: `lib/supabase/server.ts`, `lib/supabase/client.ts`
**Fix**: Add proper type guards and error handling
```typescript
if (!supabaseUrl || !supabaseKey) {
  throw new Error('Supabase configuration is missing')
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

1. **High Priority**:
   - Fix environment variable validation
   - Add proper error handling
   - Implement input validation
   - Add rate limiting

2. **Medium Priority**:
   - Consolidate Supabase client creation
   - Implement repository pattern
   - Add logging
   - Add health checks

3. **Low Priority**:
   - Add caching
   - Optimize queries
   - Add comprehensive testing
   - Complete documentation

## Next Steps

1. Start with critical security fixes
2. Implement proper error handling and validation
3. Add basic monitoring and health checks
4. Refactor code organization
5. Add testing coverage
6. Complete documentation

## Estimated Timeline

- **Week 1**: Critical fixes (security, validation, error handling)
- **Week 2**: Code organization and refactoring
- **Week 3**: Testing implementation
- **Week 4**: Documentation and monitoring setup