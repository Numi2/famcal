# FamCal Personalization & Local Storage

FamCal uses local storage for a personalized family calendar experience. All data is stored locally in your browser.

## Features

### Core Functionality
- **Family Setup**: Quick onboarding - just enter your family name to get started
- **Member Management**: Add family members anytime through the dashboard
- **Event Management**: Create and manage family events
- **Calendar Views**: Month, week, and day views
- **Family Dashboard**: Overview of family activities

### Simplified Setup Process

1. **Initial Setup**: When you first visit FamCal, you'll be prompted to:
   - Enter your family name (e.g., "The Smith Family")
   - That's it! Your family calendar is created instantly

2. **Adding Family Members**: After setup, you can:
   - Open the Family Dashboard (click the Dashboard button)
   - Use the "Family Members" section to add members
   - Set names, roles (parent/child), and colors for each member

### Local Storage Architecture

All data is stored locally using browser localStorage:
- No server required
- Data persists between sessions
- Privacy-focused - your data never leaves your device

### Data Structure

```typescript
// Family
{
  id: string
  name: string
  description?: string
  created_at: string
}

// Family Member
{
  id: string
  family_id: string
  name: string
  email?: string
  role: 'parent' | 'child'
  color: string
  created_at: string
}

// Event
{
  id: string
  family_id: string
  title: string
  start_date: string
  end_date: string
  // ... other fields
}
```

## Usage Flow

1. **First Visit**
   - Sign in (or continue as guest)
   - Enter family name when prompted
   - Start using your calendar immediately

2. **Adding Members**
   - Click "Dashboard" in the top navigation
   - Find the "Family Members" section
   - Click "Add Member" to add family members
   - Edit or remove members as needed

3. **Creating Events**
   - Click "+ Add Event" button
   - Fill in event details
   - Events are color-coded by family member

## Technical Details

### Key Components
- `FamilySetup` - Simplified onboarding (name only)
- `ManageMembers` - Add/edit/remove family members
- `LocalStorageService` - Data persistence layer
- `LocalOnboardingService` - Family creation logic

### Hooks
- `useLocalFamilyId` - Get current family ID
- `useLocalFamilyMembers` - Manage family members
- `useLocalCalendarEvents` - Manage calendar events

### API Endpoints
All functionality uses local storage - no API endpoints required!

## Benefits of Simplified Setup

1. **Faster Onboarding**: Get started in seconds with just a family name
2. **Flexible Member Management**: Add members when you're ready, not during setup
3. **Privacy First**: All data stays on your device
4. **No Account Required**: Works immediately without registration
5. **Offline Capable**: Works without internet connection

## Future Enhancements

- Export/import family data
- Multi-device sync (optional)
- Family templates
- Member permissions
- Activity tracking
