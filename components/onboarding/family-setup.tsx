"use client"

import type React from "react"

import { useState } from "react"
import { useLocalAuth } from "@/lib/local-storage/auth-context"
import { LocalOnboardingService } from "@/lib/local-storage/onboarding-service"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Heart, AlertCircle } from "lucide-react"

interface FamilySetupProps {
  onComplete: () => void
}

export function FamilySetup({ onComplete }: FamilySetupProps) {
  const { user } = useLocalAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>("")
  const [familyName, setFamilyName] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)
    setError("")

    try {
      // Create family with just the name using local storage
      await LocalOnboardingService.createDefaultFamilyForUser(
        user.id,
        user.email || "",
        familyName
      )

      onComplete()
    } catch (error) {
      console.error("Error setting up family:", error)
      setError(error instanceof Error ? error.message : "An unexpected error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 shadow-lg max-w-md mx-auto">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-3 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full w-fit">
            <Heart className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold">Welcome to FamCal!</CardTitle>
          <CardDescription>
            Let's create your family calendar. You can add family members later.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="familyName">Family Name</Label>
              <Input
                id="familyName"
                value={familyName}
                onChange={(e) => setFamilyName(e.target.value)}
                placeholder="e.g., The Smith Family"
                required
                autoFocus
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading || !familyName.trim()}>
              {loading ? "Creating..." : "Create Family"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
