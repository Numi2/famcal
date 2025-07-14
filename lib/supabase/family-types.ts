export interface Database {
  public: {
    Tables: {
      families: {
        Row: {
          id: string
          created_at: string
          name: string
          description: string | null
          settings: Json | null
          created_by: string
        }
        Insert: {
          id?: string
          created_at?: string
          name: string
          description?: string | null
          settings?: Json | null
          created_by: string
        }
        Update: {
          id?: string
          created_at?: string
          name?: string
          description?: string | null
          settings?: Json | null
          created_by?: string
        }
      }
      family_members: {
        Row: {
          id: string
          user_id: string | null
          family_id: string
          created_at: string
          updated_at: string | null
          full_name: string
          role: "parent" | "child" | "caregiver"
          age: number | null
          grade: string | null
          school: string | null
          allergies: string[] | null
          medications: string[] | null
          emergency_contact: string | null
          color: string
          avatar_url: string | null
          preferences: Json | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          family_id: string
          created_at?: string
          updated_at?: string | null
          full_name: string
          role?: "parent" | "child" | "caregiver"
          age?: number | null
          grade?: string | null
          school?: string | null
          allergies?: string[] | null
          medications?: string[] | null
          emergency_contact?: string | null
          color?: string
          avatar_url?: string | null
          preferences?: Json | null
        }
        Update: {
          id?: string
          user_id?: string | null
          family_id?: string
          created_at?: string
          updated_at?: string | null
          full_name?: string
          role?: "parent" | "child" | "caregiver"
          age?: number | null
          grade?: string | null
          school?: string | null
          allergies?: string[] | null
          medications?: string[] | null
          emergency_contact?: string | null
          color?: string
          avatar_url?: string | null
          preferences?: Json | null
        }
      }
      family_events: {
        Row: {
          id: number
          created_at: string
          updated_at: string | null
          title: string
          description: string | null
          start_time: string
          end_time: string
          day: number
          date: string
          location: string | null
          type: string
          assigned_to: string[]
          organizer: string
          color: string
          priority: "low" | "medium" | "high" | "urgent"
          is_recurring: boolean | null
          recurrence_pattern: Json | null
          reminders: Json | null
          notes: string | null
          cost: number | null
          requires_transport: boolean | null
          carpool_info: Json | null
          weather_dependent: boolean | null
          age_appropriate: Json | null
          family_id: string
        }
        Insert: {
          id?: number
          created_at?: string
          updated_at?: string | null
          title: string
          description?: string | null
          start_time: string
          end_time: string
          day: number
          date: string
          location?: string | null
          type: string
          assigned_to?: string[]
          organizer: string
          color?: string
          priority?: "low" | "medium" | "high" | "urgent"
          is_recurring?: boolean | null
          recurrence_pattern?: Json | null
          reminders?: Json | null
          notes?: string | null
          cost?: number | null
          requires_transport?: boolean | null
          carpool_info?: Json | null
          weather_dependent?: boolean | null
          age_appropriate?: Json | null
          family_id: string
        }
        Update: {
          id?: number
          created_at?: string
          updated_at?: string | null
          title?: string
          description?: string | null
          start_time?: string
          end_time?: string
          day?: number
          date?: string
          location?: string | null
          type?: string
          assigned_to?: string[]
          organizer?: string
          color?: string
          priority?: "low" | "medium" | "high" | "urgent"
          is_recurring?: boolean | null
          recurrence_pattern?: Json | null
          reminders?: Json | null
          notes?: string | null
          cost?: number | null
          requires_transport?: boolean | null
          carpool_info?: Json | null
          weather_dependent?: boolean | null
          age_appropriate?: Json | null
          family_id?: string
        }
      }
      meal_plans: {
        Row: {
          id: string
          created_at: string
          updated_at: string | null
          day: number
          meal_type: "breakfast" | "lunch" | "dinner" | "snack"
          meal: string
          ingredients: string[]
          prep_time: number
          cook_time: number
          servings: number
          allergens_considered: string[]
          nutrition_notes: string | null
          kid_friendly: boolean
          difficulty: "easy" | "medium" | "hard"
          family_id: string
          created_by: string
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string | null
          day: number
          meal_type: "breakfast" | "lunch" | "dinner" | "snack"
          meal: string
          ingredients?: string[]
          prep_time?: number
          cook_time?: number
          servings?: number
          allergens_considered?: string[]
          nutrition_notes?: string | null
          kid_friendly?: boolean
          difficulty?: "easy" | "medium" | "hard"
          family_id: string
          created_by: string
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string | null
          day?: number
          meal_type?: "breakfast" | "lunch" | "dinner" | "snack"
          meal?: string
          ingredients?: string[]
          prep_time?: number
          cook_time?: number
          servings?: number
          allergens_considered?: string[]
          nutrition_notes?: string | null
          kid_friendly?: boolean
          difficulty?: "easy" | "medium" | "hard"
          family_id?: string
          created_by?: string
        }
      }
      chore_assignments: {
        Row: {
          id: string
          created_at: string
          updated_at: string | null
          chore: string
          assigned_to: string
          due_date: string
          completed: boolean
          completed_at: string | null
          points: number
          age_appropriate: boolean
          instructions: string | null
          parent_approval_required: boolean
          family_id: string
          created_by: string
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string | null
          chore: string
          assigned_to: string
          due_date: string
          completed?: boolean
          completed_at?: string | null
          points?: number
          age_appropriate?: boolean
          instructions?: string | null
          parent_approval_required?: boolean
          family_id: string
          created_by: string
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string | null
          chore?: string
          assigned_to?: string
          due_date?: string
          completed?: boolean
          completed_at?: string | null
          points?: number
          age_appropriate?: boolean
          instructions?: string | null
          parent_approval_required?: boolean
          family_id?: string
          created_by?: string
        }
      }
      family_insights: {
        Row: {
          id: string
          created_at: string
          family_id: string
          type: "suggestion" | "warning" | "celebration" | "reminder"
          title: string
          message: string
          actionable: boolean
          action: string | null
          priority: "low" | "medium" | "high"
          related_events: number[] | null
          related_members: string[] | null
          dismissed: boolean
          dismissed_at: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          family_id: string
          type: "suggestion" | "warning" | "celebration" | "reminder"
          title: string
          message: string
          actionable?: boolean
          action?: string | null
          priority?: "low" | "medium" | "high"
          related_events?: number[] | null
          related_members?: string[] | null
          dismissed?: boolean
          dismissed_at?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          family_id?: string
          type?: "suggestion" | "warning" | "celebration" | "reminder"
          title?: string
          message?: string
          actionable?: boolean
          action?: string | null
          priority?: "low" | "medium" | "high"
          related_events?: number[] | null
          related_members?: string[] | null
          dismissed?: boolean
          dismissed_at?: string | null
        }
      }
      activity_suggestions: {
        Row: {
          id: string
          created_at: string
          title: string
          description: string
          duration: number
          min_age: number
          max_age: number
          location: "indoor" | "outdoor" | "either"
          weather_requirements: string[] | null
          materials: string[] | null
          cost: "free" | "low" | "medium" | "high"
          educational: boolean
          physical: boolean
          creative: boolean
          social: boolean
          is_public: boolean
          created_by: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          title: string
          description: string
          duration: number
          min_age: number
          max_age: number
          location: "indoor" | "outdoor" | "either"
          weather_requirements?: string[] | null
          materials?: string[] | null
          cost?: "free" | "low" | "medium" | "high"
          educational?: boolean
          physical?: boolean
          creative?: boolean
          social?: boolean
          is_public?: boolean
          created_by?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          title?: string
          description?: string
          duration?: number
          min_age?: number
          max_age?: number
          location?: "indoor" | "outdoor" | "either"
          weather_requirements?: string[] | null
          materials?: string[] | null
          cost?: "free" | "low" | "medium" | "high"
          educational?: boolean
          physical?: boolean
          creative?: boolean
          social?: boolean
          is_public?: boolean
          created_by?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]
