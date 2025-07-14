export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          updated_at: string | null
          username: string | null
          full_name: string | null
          avatar_url: string | null
          role: "parent" | "child" | "caregiver"
          family_id: string | null
          age: number | null
          grade: string | null
          school: string | null
          allergies: string[] | null
          medications: string[] | null
          emergency_contact: string | null
          color: string
          preferences: Json | null
        }
        Insert: {
          id: string
          updated_at?: string | null
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          role?: "parent" | "child" | "caregiver"
          family_id?: string | null
          age?: number | null
          grade?: string | null
          school?: string | null
          allergies?: string[] | null
          medications?: string[] | null
          emergency_contact?: string | null
          color?: string
          preferences?: Json | null
        }
        Update: {
          id?: string
          updated_at?: string | null
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          role?: "parent" | "child" | "caregiver"
          family_id?: string | null
          age?: number | null
          grade?: string | null
          school?: string | null
          allergies?: string[] | null
          medications?: string[] | null
          emergency_contact?: string | null
          color?: string
          preferences?: Json | null
        }
      }
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
      family_events: {
        Row: {
          id: number
          created_at: string
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
          title: string
          description?: string | null
          start_time: string
          end_time: string
          day: number
          date: string
          location?: string | null
          type: string
          assigned_to: string[]
          organizer: string
          color: string
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
        }
        Insert: {
          id?: string
          created_at?: string
          day: number
          meal_type: "breakfast" | "lunch" | "dinner" | "snack"
          meal: string
          ingredients: string[]
          prep_time: number
          cook_time: number
          servings: number
          allergens_considered: string[]
          nutrition_notes?: string | null
          kid_friendly?: boolean
          difficulty?: "easy" | "medium" | "hard"
          family_id: string
        }
        Update: {
          id?: string
          created_at?: string
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
        }
      }
      chore_assignments: {
        Row: {
          id: string
          created_at: string
          chore: string
          assigned_to: string
          due_date: string
          completed: boolean
          points: number
          age_appropriate: boolean
          instructions: string | null
          parent_approval_required: boolean
          family_id: string
        }
        Insert: {
          id?: string
          created_at?: string
          chore: string
          assigned_to: string
          due_date: string
          completed?: boolean
          points?: number
          age_appropriate?: boolean
          instructions?: string | null
          parent_approval_required?: boolean
          family_id: string
        }
        Update: {
          id?: string
          created_at?: string
          chore?: string
          assigned_to?: string
          due_date?: string
          completed?: boolean
          points?: number
          age_appropriate?: boolean
          instructions?: string | null
          parent_approval_required?: boolean
          family_id?: string
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
