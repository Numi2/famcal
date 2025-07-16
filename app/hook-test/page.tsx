"use client"

import { useState, useEffect } from "react"

export default function HookTestPage() {
  const [status, setStatus] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const testHooks = async () => {
      try {
        setStatus(prev => [...prev, "Testing TimezoneProvider..."])
        const { useTimezone } = await import("@/lib/hooks/use-timezone")
        // Don't actually call the hook here, just check if it imports
        setStatus(prev => [...prev, "✓ TimezoneProvider imported"])

        setStatus(prev => [...prev, "Testing LocalAuth..."])
        const { useLocalAuth } = await import("@/lib/local-storage/auth-context")
        setStatus(prev => [...prev, "✓ LocalAuth imported"])

        setStatus(prev => [...prev, "Testing LocalFamilyId..."])
        const { useLocalFamilyId } = await import("@/lib/local-storage/hooks")
        setStatus(prev => [...prev, "✓ LocalFamilyId imported"])

        setStatus(prev => [...prev, "All hooks imported successfully!"])
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err)
        setError(errorMsg)
        console.error("Hook test error:", err)
      }
    }

    testHooks()
  }, [])

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Hook Test Page</h1>
      
      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
          <h2 className="font-semibold">Error:</h2>
          <p>{error}</p>
        </div>
      )}

      <div className="space-y-1">
        {status.map((s, i) => (
          <div key={i} className={s.includes("✓") ? "text-green-600" : "text-gray-600"}>
            {s}
          </div>
        ))}
      </div>
    </div>
  )
}