import { createClient } from "@supabase/supabase-js"
import type { Database } from "./family-types"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

// Family-specific database operations
export const familyDb = {
  // Families
  async createFamily(name: string, description?: string) {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new Error("Not authenticated")

    const { data, error } = await supabase
      .from("families")
      .insert({
        name,
        description,
        created_by: user.id,
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  async getFamilyByUserId(userId: string) {
    const { data, error } = await supabase
      .from("family_members")
      .select(`
        family_id,
        families (*)
      `)
      .eq("user_id", userId)
      .single()

    if (error) throw error
    return data?.families
  },

  // Family Members
  async createFamilyMember(
    familyId: string,
    memberData: {
      full_name: string
      role: "parent" | "child" | "caregiver"
      age?: number
      grade?: string
      school?: string
      allergies?: string[]
      medications?: string[]
      color?: string
      user_id?: string
    },
  ) {
    const { data, error } = await supabase
      .from("family_members")
      .insert({
        family_id: familyId,
        ...memberData,
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  async getFamilyMembers(familyId: string) {
    const { data, error } = await supabase
      .from("family_members")
      .select("*")
      .eq("family_id", familyId)
      .order("role", { ascending: true })
      .order("age", { ascending: true })

    if (error) throw error
    return data || []
  },

  // Family Events
  async createFamilyEvent(eventData: {
    title: string
    description?: string
    start_time: string
    end_time: string
    day: number
    date: string
    location?: string
    type: string
    assigned_to: string[]
    organizer: string
    color?: string
    priority?: "low" | "medium" | "high" | "urgent"
    family_id: string
  }) {
    const { data, error } = await supabase.from("family_events").insert(eventData).select().single()

    if (error) throw error
    return data
  },

  async getFamilyEvents(familyId: string) {
    const { data, error } = await supabase
      .from("family_events")
      .select("*")
      .eq("family_id", familyId)
      .order("day", { ascending: true })
      .order("start_time", { ascending: true })

    if (error) throw error
    return data || []
  },

  async getFamilyEventsByDay(familyId: string, day: number) {
    const { data, error } = await supabase
      .from("family_events")
      .select("*")
      .eq("family_id", familyId)
      .eq("day", day)
      .order("start_time", { ascending: true })

    if (error) throw error
    return data || []
  },

  // Meal Plans
  async createMealPlan(mealData: {
    day: number
    meal_type: "breakfast" | "lunch" | "dinner" | "snack"
    meal: string
    ingredients?: string[]
    prep_time?: number
    cook_time?: number
    servings?: number
    kid_friendly?: boolean
    difficulty?: "easy" | "medium" | "hard"
    family_id: string
    created_by: string
  }) {
    const { data, error } = await supabase.from("meal_plans").insert(mealData).select().single()

    if (error) throw error
    return data
  },

  async getMealPlans(familyId: string, day?: number) {
    let query = supabase.from("meal_plans").select("*").eq("family_id", familyId)

    if (day) {
      query = query.eq("day", day)
    }

    const { data, error } = await query.order("day", { ascending: true })

    if (error) throw error
    return data || []
  },

  // Chore Assignments
  async createChoreAssignment(choreData: {
    chore: string
    assigned_to: string
    due_date: string
    points?: number
    age_appropriate?: boolean
    instructions?: string
    parent_approval_required?: boolean
    family_id: string
    created_by: string
  }) {
    const { data, error } = await supabase.from("chore_assignments").insert(choreData).select().single()

    if (error) throw error
    return data
  },

  async getChoreAssignments(familyId: string, assignedTo?: string) {
    let query = supabase.from("chore_assignments").select("*").eq("family_id", familyId)

    if (assignedTo) {
      query = query.eq("assigned_to", assignedTo)
    }

    const { data, error } = await query.order("due_date", { ascending: true })

    if (error) throw error
    return data || []
  },

  async updateChoreCompletion(choreId: string, completed: boolean) {
    const { data, error } = await supabase
      .from("chore_assignments")
      .update({
        completed,
        completed_at: completed ? new Date().toISOString() : null,
      })
      .eq("id", choreId)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Activity Suggestions
  async getActivitySuggestions(filters?: {
    minAge?: number
    maxAge?: number
    location?: "indoor" | "outdoor" | "either"
    cost?: "free" | "low" | "medium" | "high"
    duration?: number
  }) {
    let query = supabase.from("activity_suggestions").select("*").eq("is_public", true)

    if (filters?.minAge) {
      query = query.lte("min_age", filters.minAge)
    }
    if (filters?.maxAge) {
      query = query.gte("max_age", filters.maxAge)
    }
    if (filters?.location && filters.location !== "either") {
      query = query.or(`location.eq.${filters.location},location.eq.either`)
    }
    if (filters?.cost) {
      query = query.eq("cost", filters.cost)
    }
    if (filters?.duration) {
      query = query.lte("duration", filters.duration)
    }

    const { data, error } = await query.order("created_at", { ascending: false })

    if (error) throw error
    return data || []
  },

  // Family Insights
  async getFamilyInsights(familyId: string) {
    const { data, error } = await supabase
      .from("family_insights")
      .select("*")
      .eq("family_id", familyId)
      .eq("dismissed", false)
      .order("priority", { ascending: false })
      .order("created_at", { ascending: false })

    if (error) throw error
    return data || []
  },

  async dismissInsight(insightId: string) {
    const { data, error } = await supabase
      .from("family_insights")
      .update({
        dismissed: true,
        dismissed_at: new Date().toISOString(),
      })
      .eq("id", insightId)
      .select()
      .single()

    if (error) throw error
    return data
  },
}
