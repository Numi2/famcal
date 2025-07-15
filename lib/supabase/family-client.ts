import { createClient } from "@supabase/supabase-js"
import type { Database } from "./family-types"
import type { SupabaseClient } from "@supabase/supabase-js"

// Create client lazily to avoid build-time environment variable issues
let _supabase: SupabaseClient<Database> | null = null

function getSupabaseClient(): SupabaseClient<Database> {
  if (!_supabase) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error("Missing Supabase environment variables")
    }
    
    _supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)
  }
  return _supabase
}

export const supabase = getSupabaseClient

// Family-specific database operations
export const familyDb = {
  // Families
  async createFamily(name: string, description?: string, client?: SupabaseClient<Database>) {
    const supabaseClient = client || getSupabaseClient()
    const {
      data: { user },
    } = await supabaseClient.auth.getUser()
    if (!user) throw new Error("Not authenticated")

    const { data, error } = await supabaseClient
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

  async getFamilyByUserId(userId: string, client?: SupabaseClient<Database>) {
    const supabaseClient = client || getSupabaseClient()
    const { data, error } = await supabaseClient
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
    client?: SupabaseClient<Database>
  ) {
    const supabaseClient = client || getSupabaseClient()
    const { data, error } = await supabaseClient
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

  async getFamilyMembers(familyId: string, client?: SupabaseClient<Database>) {
    const supabaseClient = client || getSupabaseClient()
    const { data, error } = await supabaseClient
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
  }, client?: SupabaseClient<Database>) {
    const supabaseClient = client || getSupabaseClient()
    const { data, error } = await supabaseClient.from("family_events").insert(eventData).select().single()

    if (error) throw error
    return data
  },

  async getFamilyEvents(familyId: string, day?: number, client?: SupabaseClient<Database>) {
    const supabaseClient = client || getSupabaseClient()
    let query = supabaseClient.from("family_events").select("*").eq("family_id", familyId)

    if (day) {
      query = query.eq("day", day)
    }

    const { data, error } = await query.order("start_time", { ascending: true })

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
  }, client?: SupabaseClient<Database>) {
    const supabaseClient = client || getSupabaseClient()
    const { data, error } = await supabaseClient.from("meal_plans").insert(mealData).select().single()

    if (error) throw error
    return data
  },

  async getMealPlans(familyId: string, day?: number, client?: SupabaseClient<Database>) {
    const supabaseClient = client || getSupabaseClient()
    let query = supabaseClient.from("meal_plans").select("*").eq("family_id", familyId)

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
  }, client?: SupabaseClient<Database>) {
    const supabaseClient = client || getSupabaseClient()
    const { data, error } = await supabaseClient.from("chore_assignments").insert(choreData).select().single()

    if (error) throw error
    return data
  },

  async getChoreAssignments(familyId: string, assignedTo?: string, client?: SupabaseClient<Database>) {
    const supabaseClient = client || getSupabaseClient()
    let query = supabaseClient.from("chore_assignments").select("*").eq("family_id", familyId)

    if (assignedTo) {
      query = query.eq("assigned_to", assignedTo)
    }

    const { data, error } = await query.order("due_date", { ascending: true })

    if (error) throw error
    return data || []
  },

  async updateChoreCompletion(choreId: string, completed: boolean) {
    const { data, error } = await getSupabaseClient()
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
  }, client?: SupabaseClient<Database>) {
    const supabaseClient = client || getSupabaseClient()
    let query = supabaseClient.from("activity_suggestions").select("*").eq("is_public", true)

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
    const { data, error } = await getSupabaseClient()
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
    const { data, error } = await getSupabaseClient()
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
