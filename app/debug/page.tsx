"use client"

import { useState, useEffect } from "react"

export default function DebugPage() {
  const [errors, setErrors] = useState<string[]>([])
  const [status, setStatus] = useState<string[]>([])

  useEffect(() => {
    const testImports = async () => {
      const imports = [
        { name: "LocalAuth", fn: () => import("@/lib/local-storage/auth-context") },
        { name: "Hooks", fn: () => import("@/lib/local-storage/hooks") },
        { name: "Dialog", fn: () => import("@/components/ui/dialog") },
        { name: "FamilySetup", fn: () => import("@/components/onboarding/family-setup") },
      ]

      for (const { name, fn } of imports) {
        try {
          await fn()
          setStatus(prev => [...prev, `✓ ${name} loaded successfully`])
        } catch (error) {
          const errorMsg = `✗ ${name} failed: ${error instanceof Error ? error.message : String(error)}`
          setErrors(prev => [...prev, errorMsg])
          console.error(errorMsg, error)
        }
      }
    }

    testImports()
  }, [])

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Debug Page</h1>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Import Status:</h2>
        <div className="space-y-1">
          {status.map((s, i) => (
            <div key={i} className="text-green-600">{s}</div>
          ))}
        </div>
      </div>

      {errors.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-2 text-red-600">Errors:</h2>
          <div className="space-y-1">
            {errors.map((error, i) => (
              <div key={i} className="text-red-600">{error}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}