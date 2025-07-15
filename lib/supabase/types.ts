export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          family_id: string | null
          role: string | null
          phone_number: string | null
          notification_preferences: Json | null
          created_at: string
          updated_at: string
          last_seen_at: string | null
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          family_id?: string | null
          role?: string | null
          phone_number?: string | null
          notification_preferences?: Json | null
          created_at?: string
          updated_at?: string
          last_seen_at?: string | null
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          family_id?: string | null
          role?: string | null
          phone_number?: string | null
          notification_preferences?: Json | null
          created_at?: string
          updated_at?: string
          last_seen_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: "families_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: "family_members_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "family_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: "family_events_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "family_events_organizer_fkey"
            columns: ["organizer"]
            isOneToOne: false
            referencedRelation: "family_members"
            referencedColumns: ["id"]
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: "meal_plans_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "family_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meal_plans_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: "chore_assignments_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "family_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chore_assignments_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "family_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chore_assignments_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: "family_insights_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: "activity_suggestions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "family_members"
            referencedColumns: ["id"]
          },
        ]
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] & PublicSchema["Views"]) | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    ? (PublicSchema["Tables"] & PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends keyof PublicSchema["Tables"] | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends keyof PublicSchema["Tables"] | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends keyof PublicSchema["Enums"] | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never
