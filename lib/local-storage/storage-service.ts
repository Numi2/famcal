import { 
  Family, 
  FamilyMember, 
  CalendarEvent, 
  LocalStorageData, 
  EventFilter 
} from './types';

const STORAGE_KEY = 'family-calendar-data';

class LocalStorageService {
  private data: LocalStorageData;

  constructor() {
    this.data = this.loadData();
  }

  private loadData(): LocalStorageData {
    if (typeof window === 'undefined') {
      return {
        families: [],
        familyMembers: [],
        events: []
      };
    }

    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return {
        families: [],
        familyMembers: [],
        events: []
      };
    }

    try {
      return JSON.parse(stored);
    } catch (error) {
      console.error('Failed to parse stored data:', error);
      return {
        families: [],
        familyMembers: [],
        events: []
      };
    }
  }

  private saveData(): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
    }
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // Family operations
  async createFamily(name: string, description?: string): Promise<Family> {
    const family: Family = {
      id: this.generateId(),
      name,
      description,
      created_at: new Date().toISOString()
    };

    this.data.families.push(family);
    this.data.currentFamilyId = family.id;
    this.saveData();
    
    return family;
  }

  async getFamily(familyId: string): Promise<Family | null> {
    return this.data.families.find(f => f.id === familyId) || null;
  }

  async getCurrentFamily(): Promise<Family | null> {
    if (!this.data.currentFamilyId) {
      // Return first family if exists
      return this.data.families[0] || null;
    }
    return this.getFamily(this.data.currentFamilyId);
  }

  async updateFamily(familyId: string, updates: Partial<Family>): Promise<Family> {
    const index = this.data.families.findIndex(f => f.id === familyId);
    if (index === -1) throw new Error('Family not found');

    this.data.families[index] = { ...this.data.families[index], ...updates };
    this.saveData();
    
    return this.data.families[index];
  }

  async deleteFamily(familyId: string): Promise<void> {
    this.data.families = this.data.families.filter(f => f.id !== familyId);
    this.data.familyMembers = this.data.familyMembers.filter(m => m.family_id !== familyId);
    this.data.events = this.data.events.filter(e => e.family_id !== familyId);
    
    if (this.data.currentFamilyId === familyId) {
      this.data.currentFamilyId = this.data.families[0]?.id;
    }
    
    this.saveData();
  }

  // Family member operations
  async createFamilyMember(member: Omit<FamilyMember, 'id' | 'created_at'>): Promise<FamilyMember> {
    const newMember: FamilyMember = {
      ...member,
      id: this.generateId(),
      created_at: new Date().toISOString()
    };

    this.data.familyMembers.push(newMember);
    this.saveData();
    
    return newMember;
  }

  async getFamilyMembers(familyId: string): Promise<FamilyMember[]> {
    return this.data.familyMembers.filter(m => m.family_id === familyId);
  }

  async updateFamilyMember(memberId: string, updates: Partial<FamilyMember>): Promise<FamilyMember> {
    const index = this.data.familyMembers.findIndex(m => m.id === memberId);
    if (index === -1) throw new Error('Member not found');

    this.data.familyMembers[index] = { ...this.data.familyMembers[index], ...updates };
    this.saveData();
    
    return this.data.familyMembers[index];
  }

  async deleteFamilyMember(memberId: string): Promise<void> {
    this.data.familyMembers = this.data.familyMembers.filter(m => m.id !== memberId);
    // Remove member from event attendees
    this.data.events = this.data.events.map(event => ({
      ...event,
      attendees: event.attendees.filter(id => id !== memberId)
    }));
    this.saveData();
  }

  // Event operations
  async createEvent(event: Omit<CalendarEvent, 'id' | 'created_at' | 'updated_at'>): Promise<CalendarEvent> {
    const newEvent: CalendarEvent = {
      ...event,
      id: this.generateId(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    this.data.events.push(newEvent);
    this.saveData();
    
    return newEvent;
  }

  async getEvents(filter?: EventFilter): Promise<CalendarEvent[]> {
    let events = [...this.data.events];

    if (filter?.familyId) {
      events = events.filter(e => e.family_id === filter.familyId);
    }

    if (filter?.startDate) {
      events = events.filter(e => new Date(e.start_time) >= filter.startDate!);
    }

    if (filter?.endDate) {
      events = events.filter(e => new Date(e.start_time) <= filter.endDate!);
    }

    if (filter?.category) {
      events = events.filter(e => e.category === filter.category);
    }

    if (filter?.attendeeId) {
      events = events.filter(e => e.attendees.includes(filter.attendeeId!));
    }

    return events.sort((a, b) => 
      new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
    );
  }

  async getEvent(eventId: string): Promise<CalendarEvent | null> {
    return this.data.events.find(e => e.id === eventId) || null;
  }

  async updateEvent(eventId: string, updates: Partial<CalendarEvent>): Promise<CalendarEvent> {
    const index = this.data.events.findIndex(e => e.id === eventId);
    if (index === -1) throw new Error('Event not found');

    this.data.events[index] = { 
      ...this.data.events[index], 
      ...updates,
      updated_at: new Date().toISOString()
    };
    this.saveData();
    
    return this.data.events[index];
  }

  async deleteEvent(eventId: string): Promise<void> {
    this.data.events = this.data.events.filter(e => e.id !== eventId);
    this.saveData();
  }

  // Utility methods
  async clearAllData(): Promise<void> {
    this.data = {
      families: [],
      familyMembers: [],
      events: []
    };
    this.saveData();
  }

  async exportData(): Promise<LocalStorageData> {
    return { ...this.data };
  }

  async importData(data: LocalStorageData): Promise<void> {
    this.data = data;
    this.saveData();
  }

  // Initialize with demo data if empty
  async initializeDemoData(): Promise<void> {
    if (this.data.families.length > 0) return;

    // Create demo family
    const family = await this.createFamily('Smith Family', 'Our family calendar');
    
    // Create family members
    const dad = await this.createFamilyMember({
      family_id: family.id,
      name: 'John Smith',
      email: 'john@example.com',
      role: 'parent',
      color: '#3b82f6'
    });

    const mom = await this.createFamilyMember({
      family_id: family.id,
      name: 'Jane Smith',
      email: 'jane@example.com',
      role: 'parent',
      color: '#ec4899'
    });

    const child1 = await this.createFamilyMember({
      family_id: family.id,
      name: 'Emma Smith',
      role: 'child',
      color: '#10b981'
    });

    const child2 = await this.createFamilyMember({
      family_id: family.id,
      name: 'Lucas Smith',
      role: 'child',
      color: '#f59e0b'
    });

    // Create sample events
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    await this.createEvent({
      family_id: family.id,
      title: 'Soccer Practice',
      description: 'Weekly soccer practice at the community field',
      start_time: tomorrow.toISOString(),
      end_time: new Date(tomorrow.getTime() + 90 * 60000).toISOString(),
      location: 'Community Sports Field',
      category: 'activity',
      attendees: [child1.id],
      color: '#10b981'
    });

    await this.createEvent({
      family_id: family.id,
      title: 'Family Dinner',
      description: 'Weekly family dinner at grandma\'s',
      start_time: new Date(today.getTime() + 3 * 24 * 60 * 60000).toISOString(),
      end_time: new Date(today.getTime() + 3 * 24 * 60 * 60000 + 2 * 60 * 60000).toISOString(),
      location: 'Grandma\'s House',
      category: 'meal',
      attendees: [dad.id, mom.id, child1.id, child2.id],
      color: '#f59e0b'
    });
  }
}

// Export singleton instance
export const localStorageService = new LocalStorageService();