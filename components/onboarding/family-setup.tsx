"use client"

import type React from "react"

import { useState } from "react"
import { useLocalAuth } from "@/lib/local-storage/auth-context"
import { localStorageService } from "@/lib/local-storage/storage-service"
import type { OnboardingData } from "@/lib/services/user-onboarding"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Plus, Users, Heart, AlertCircle } from "lucide-react"

interface FamilySetupProps {
  onComplete: () => void
}

export function FamilySetup({ onComplete }: FamilySetupProps) {
  const { user } = useLocalAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>("")
  const [step, setStep] = useState(1)
  const [familyData, setFamilyData] = useState<OnboardingData>({
    familyName: "",
    familyDescription: "",
    members: [],
  })

  const handleFamilyNameSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (familyData.familyName.trim()) {
      setStep(2)
    }
  }

  const addMember = () => {
    setFamilyData((prev) => ({
      ...prev,
      members: [
        ...prev.members,
        {
          full_name: "",
          role: "parent",
          color: "bg-blue-500",
        },
      ],
    }))
  }

  const updateMember = (index: number, field: string, value: string) => {
    setFamilyData((prev) => ({
      ...prev,
      members: prev.members.map((member, i) => (i === index ? { ...member, [field]: value } : member)),
    }))
  }

  const removeMember = (index: number) => {
    setFamilyData((prev) => ({
      ...prev,
      members: prev.members.filter((_, i) => i !== index),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)
    setError("")

    try {
      // Filter out empty members
      const validMembers = familyData.members.filter((member) => member.full_name.trim())

      if (validMembers.length === 0) {
        // Add the current user as a parent if no members
        validMembers.push({
          full_name: user.email?.split("@")[0] || "Parent",
          role: "parent",
          color: "bg-blue-500",
        })
      }

      // Use the API endpoint to create the family
      const response = await fetch("/api/family/setup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Include cookies with the request
        body: JSON.stringify({
          familyName: familyData.familyName,
          familyDescription: familyData.familyDescription,
          members: validMembers,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to create family")
      }

      onComplete()
    } catch (error) {
      console.error("Error setting up family:", error)
      setError(error instanceof Error ? error.message : "An unexpected error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const colors = [
    "bg-blue-500",
    "bg-pink-500",
    "bg-purple-500",
    "bg-green-500",
    "bg-yellow-500",
    "bg-red-500",
    "bg-indigo-500",
    "bg-teal-500",
  ]

  if (step === 1) {
    return (
      <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 shadow-lg max-w-md mx-auto">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-3 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full w-fit">
              <Heart className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold">Welcome to FamCal!</CardTitle>
            <CardDescription>Let's set up your family calendar. First, tell us about your family.</CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <form onSubmit={handleFamilyNameSubmit} className="space-y-4">
              <div>
                <Label htmlFor="familyName">Family Name</Label>
                <Input
                  id="familyName"
                  value={familyData.familyName}
                  onChange={(e) => setFamilyData((prev) => ({ ...prev, familyName: e.target.value }))}
                  placeholder="e.g., The Smith Family"
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Description (Optional)</Label>
                <Input
                  id="description"
                  value={familyData.familyDescription}
                  onChange={(e) => setFamilyData((prev) => ({ ...prev, familyDescription: e.target.value }))}
                  placeholder="Tell us about your family"
                />
              </div>
              <Button type="submit" className="w-full" disabled={!familyData.familyName.trim()}>
                Continue
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 shadow-lg max-w-2xl mx-auto">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-3 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full w-fit">
            <Users className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold">Add Family Members</CardTitle>
          <CardDescription>Add the members of your family to get started with personalized scheduling.</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              {familyData.members.map((member, index) => (
                <div key={index} className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Family Member {index + 1}</h4>
                    {familyData.members.length > 1 && (
                      <Button type="button" variant="outline" size="sm" onClick={() => removeMember(index)}>
                        Remove
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <Label>Name</Label>
                      <Input
                        value={member.full_name}
                        onChange={(e) => updateMember(index, "full_name", e.target.value)}
                        placeholder="Full name"
                        required
                      />
                    </div>

                    <div>
                      <Label>Role</Label>
                      <Select value={member.role} onValueChange={(value) => updateMember(index, "role", value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="parent">Parent</SelectItem>
                          <SelectItem value="child">Child</SelectItem>
                          <SelectItem value="caregiver">Caregiver</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {member.role === "child" && (
                      <>
                        <div>
                          <Label>Age</Label>
                          <Input
                            type="number"
                            value={member.age || ""}
                            onChange={(e) => updateMember(index, "age", e.target.value)}
                            placeholder="Age"
                          />
                        </div>

                        <div>
                          <Label>Grade</Label>
                          <Input
                            value={member.grade || ""}
                            onChange={(e) => updateMember(index, "grade", e.target.value)}
                            placeholder="e.g., 3rd Grade"
                          />
                        </div>
                      </>
                    )}

                    <div>
                      <Label>Color</Label>
                      <Select value={member.color} onValueChange={(value) => updateMember(index, "color", value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {colors.map((color) => (
                            <SelectItem key={color} value={color}>
                              <div className="flex items-center gap-2">
                                <div className={`w-4 h-4 rounded-full ${color}`} />
                                {color.replace("bg-", "").replace("-500", "")}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <Button type="button" variant="outline" onClick={addMember} className="w-full bg-transparent">
              <Plus className="h-4 w-4 mr-2" />
              Add Another Member
            </Button>

            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={() => setStep(1)} className="flex-1">
                Back
              </Button>
              <Button type="submit" className="flex-1" disabled={loading || familyData.members.length === 0}>
                {loading ? "Setting up..." : "Complete Setup"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
