"use client"

import type React from "react"

import { useState } from "react"
import { X, Mail, Lock, User, Eye, EyeOff, Loader2, Heart } from "lucide-react"
import { useAuth } from "@/lib/auth/auth-context"
import { UserOnboardingService } from "@/lib/services/user-onboarding"
import { supabase } from "@/lib/supabase/client"

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  initialMode?: "signin" | "signup"
}

export default function AuthModal({ isOpen, onClose, initialMode = "signin" }: AuthModalProps) {
  const [mode, setMode] = useState<"signin" | "signup" | "forgot">(initialMode)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [message, setMessage] = useState("")

  const { signIn, signUp, resetPassword } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setMessage("")

    try {
      if (mode === "signin") {
        const { error } = await signIn(email, password)
        if (error) {
          setError(error.message)
        } else {
          onClose()
        }
      } else if (mode === "signup") {
        const { error } = await signUp(email, password, fullName)
        if (error) {
          setError(error.message)
        } else {
          // Create a default family for the new user
          try {
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
              await UserOnboardingService.createDefaultFamilyForUser(
                user.id,
                email,
                fullName
              )
            }
            setMessage("Account created successfully! Check your email for confirmation.")
            onClose()
          } catch (familyError) {
            console.error('Error creating family:', familyError)
            setMessage("Account created! Check your email for confirmation. You can set up your family later.")
          }
        }
      } else if (mode === "forgot") {
        const { error } = await resetPassword(email)
        if (error) {
          setError(error.message)
        } else {
          setMessage("Check your email for the password reset link!")
        }
      }
    } catch (err) {
      setError("An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setEmail("")
    setPassword("")
    setFullName("")
    setError("")
    setMessage("")
    setShowPassword(false)
  }

  const switchMode = (newMode: "signin" | "signup" | "forgot") => {
    setMode(newMode)
    resetForm()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full">
              <Heart className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                {mode === "signin" && "Welcome Back"}
                {mode === "signup" && "Join Your Family"}
                {mode === "forgot" && "Reset Password"}
              </h2>
              <p className="text-sm text-gray-600">
                {mode === "signin" && "Sign in to your family calendar"}
                {mode === "signup" && "Create your family calendar account"}
                {mode === "forgot" && "Enter your email to reset password"}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {message && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-600 text-sm">{message}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "signup" && (
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter your full name"
                  required
                />
              </div>
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Enter your email"
                required
              />
            </div>
          </div>

          {mode !== "forgot" && (
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter your password"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {mode === "signup" && (
                <p className="text-xs text-gray-500 mt-1">Password must be at least 6 characters</p>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-3 px-4 rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="h-5 w-5 animate-spin" />}
            {mode === "signin" && "Sign In"}
            {mode === "signup" && "Create Account"}
            {mode === "forgot" && "Send Reset Link"}
          </button>
        </form>

        {/* Footer Links */}
        <div className="mt-6 text-center space-y-2">
          {mode === "signin" && (
            <>
              <button
                onClick={() => switchMode("forgot")}
                className="text-sm text-purple-600 hover:text-purple-700 transition-colors"
              >
                Forgot your password?
              </button>
              <div className="text-sm text-gray-600">
                Don't have an account?{" "}
                <button
                  onClick={() => switchMode("signup")}
                  className="text-purple-600 hover:text-purple-700 font-medium transition-colors"
                >
                  Sign up
                </button>
              </div>
            </>
          )}

          {mode === "signup" && (
            <div className="text-sm text-gray-600">
              Already have an account?{" "}
              <button
                onClick={() => switchMode("signin")}
                className="text-purple-600 hover:text-purple-700 font-medium transition-colors"
              >
                Sign in
              </button>
            </div>
          )}

          {mode === "forgot" && (
            <div className="text-sm text-gray-600">
              Remember your password?{" "}
              <button
                onClick={() => switchMode("signin")}
                className="text-purple-600 hover:text-purple-700 font-medium transition-colors"
              >
                Sign in
              </button>
            </div>
          )}
        </div>

        {/* Terms */}
        {mode === "signup" && (
          <p className="text-xs text-gray-500 text-center mt-4">
            By creating an account, you agree to our{" "}
            <a href="#" className="text-purple-600 hover:text-purple-700">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="#" className="text-purple-600 hover:text-purple-700">
              Privacy Policy
            </a>
          </p>
        )}
      </div>
    </div>
  )
}
