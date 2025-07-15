import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth/auth-context'
import { useFamilyId } from '@/lib/hooks/use-family-id'
import { familyDb } from '@/lib/supabase/family-client'
import type { FamilyMember, FamilyEvent, MealPlan, ChoreAssignment } from '@/lib/family/types'

export function useFamilyData() {
  const { user } = useAuth()
  const { familyId, loading: familyIdLoading } = useFamilyId()
  
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([])
  const [familyEvents, setFamilyEvents] = useState<FamilyEvent[]>([])
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([])
  const [choreAssignments, setChoreAssignments] = useState<ChoreAssignment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadFamilyData() {
      if (!user) {
        setLoading(false)
        return
      }

      if (!familyId) {
        // User is authenticated but doesn't have a family yet
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)

        // Fetch all family data in parallel
        const [members, events, meals, chores] = await Promise.all([
          familyDb.getFamilyMembers(familyId),
          familyDb.getFamilyEvents(familyId),
          familyDb.getMealPlans(familyId),
          familyDb.getChoreAssignments(familyId)
        ])

        // Transform database data to match the expected format
        const transformedMembers: FamilyMember[] = members.map(member => ({
          id: member.id,
          name: member.full_name,
          role: member.role,
          age: member.age || undefined,
          grade: member.grade || undefined,
          school: member.school || undefined,
          color: member.color || 'bg-blue-500',
          allergies: member.allergies || [],
          preferences: member.preferences || {},
          avatarUrl: member.avatar_url || undefined
        }))

        const transformedEvents: FamilyEvent[] = events.map(event => ({
          id: event.id,
          title: event.title,
          startTime: event.start_time,
          endTime: event.end_time,
          day: event.day,
          date: event.date,
          description: event.description || '',
          location: event.location || '',
          type: event.type,
          assignedTo: event.assigned_to || [],
          organizer: event.organizer,
          color: event.color || 'bg-blue-500',
          priority: event.priority || 'medium'
        }))

        const transformedMeals: MealPlan[] = meals.map(meal => ({
          id: meal.id,
          day: meal.day,
          mealType: meal.meal_type,
          meal: meal.meal,
          ingredients: meal.ingredients || [],
          prepTime: meal.prep_time || 0,
          cookTime: meal.cook_time || 0,
          servings: meal.servings || 4,
          kidFriendly: meal.kid_friendly || false,
          difficulty: meal.difficulty || 'easy'
        }))

        const transformedChores: ChoreAssignment[] = chores.map(chore => ({
          id: chore.id,
          chore: chore.chore,
          assignedTo: chore.assigned_to,
          dueDate: chore.due_date,
          completed: chore.completed || false,
          points: chore.points || 0,
          ageAppropriate: chore.age_appropriate || false,
          instructions: chore.instructions || '',
          parentApprovalRequired: chore.parent_approval_required || false
        }))

        setFamilyMembers(transformedMembers)
        setFamilyEvents(transformedEvents)
        setMealPlans(transformedMeals)
        setChoreAssignments(transformedChores)

      } catch (err) {
        console.error('Error loading family data:', err)
        setError(err instanceof Error ? err.message : 'Failed to load family data')
      } finally {
        setLoading(false)
      }
    }

    if (!familyIdLoading) {
      loadFamilyData()
    }
  }, [user, familyId, familyIdLoading])

  return {
    familyMembers,
    familyEvents,
    mealPlans,
    choreAssignments,
    loading: loading || familyIdLoading,
    error
  }
}
