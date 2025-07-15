# Family Calendar Personalization

This document explains how the Family Calendar app has been updated to provide personalized experiences for authenticated users.

## Overview

The app now supports user personalization through:
- **User Authentication**: Supabase Auth integration
- **Family Setup**: Onboarding flow for new users
- **Personalized Data**: Real user data instead of sample data
- **Family Management**: Users can create and manage their own families

## Key Features

### 1. User Authentication
- Users can sign up and sign in using email/password
- Authentication state is managed globally
- Protected routes and features

### 2. Family Onboarding
- New users are guided through family setup
- Users can create their family and add members
- Automatic family creation for new signups

### 3. Personalized Data
- Real family data is fetched from Supabase
- Sample data is only shown as fallback
- User-specific events, meals, and chores

### 4. Family Management
- Users can add family members
- Each member has customizable properties
- Role-based permissions (parent, child, caregiver)

## Implementation Details

### Authentication Flow
1. User signs up/signs in via AuthModal
2. On successful signup, a default family is created
3. User is redirected to onboarding if no family exists
4. After onboarding, personalized data is loaded

### Data Flow
1. `useAuth()` - Manages authentication state
2. `useFamilyId()` - Gets user's family ID
3. `useFamilyData()` - Fetches personalized family data
4. Components display real user data

### Database Schema
- `profiles` table: User profiles with family_id
- `families` table: Family information
- `family_members` table: Family member details
- `family_events` table: User-specific events
- `meal_plans` table: Family meal plans
- `chore_assignments` table: Family chores

## Usage

### For New Users
1. Sign up with email and password
2. Complete family setup onboarding
3. Add family members and details
4. Start using personalized calendar

### For Existing Users
1. Sign in with email and password
2. View personalized family data
3. Manage family members and events

## Technical Components

### Hooks
- `useAuth()` - Authentication state
- `useFamilyId()` - Family ID retrieval
- `useFamilyData()` - Personalized data fetching

### Services
- `UserOnboardingService` - Family setup logic
- `familyDb` - Database operations

### Components
- `AuthModal` - Sign up/sign in
- `FamilySetup` - Onboarding flow
- `LoadingState` - Loading indicators

### API Endpoints
- `/api/family/setup` - Family creation

## Benefits

1. **Personalization**: Each user sees their own family data
2. **Privacy**: Data is isolated per family
3. **Scalability**: Supports multiple families
4. **User Experience**: Smooth onboarding flow
5. **Data Integrity**: Real-time synchronization

## Future Enhancements

1. **Family Invitations**: Invite family members via email
2. **Multiple Families**: Support for users in multiple families
3. **Family Settings**: Customizable family preferences
4. **Data Export**: Export family data
5. **Advanced Permissions**: Role-based access control
