"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { getUserDb } from "@/database/userDb"

export default function OnboardingPage() {
  const [name, setName] = useState("")
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    setLoading(true)
    const userId = `${name.trim().toLowerCase().replace(/\s+/g, "_")}_${Date.now()}`

    if (typeof window !== "undefined") {
      localStorage.setItem("familyUserId", userId)
      localStorage.setItem("familyUserName", name.trim())
    }

    // Kick off DB creation but don't block navigation
    getUserDb(userId).catch(console.error)

    router.replace("/")
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-500 to-pink-500 p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-xl p-8 w-full max-w-md"
      >
        <h1 className="text-2xl font-bold mb-4 text-center text-purple-700">Welcome to Family Calendar</h1>
        <p className="mb-6 text-sm text-gray-700 text-center">
          Let’s set up your space! Enter your name to get started.
        </p>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 mb-4"
        />
        <button
          type="submit"
          className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 rounded-lg transition-colors"
          disabled={loading}
        >
          {loading ? "Setting up…" : "Continue"}
        </button>
      </form>
    </div>
  )
}