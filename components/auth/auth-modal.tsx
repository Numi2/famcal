"use client"

import type React from "react"
import { X, Heart } from "lucide-react"

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  initialMode?: "signin" | "signup"
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-md mx-4 p-6">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Content */}
        <div className="text-center">
          <div className="mx-auto w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-4">
            <Heart className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          
          <h2 className="text-2xl font-bold mb-2">Welcome to Family Calendar</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            This is a local-only version of the app. All your data is stored locally in your browser.
          </p>
          
          <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400 text-left bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <p>✓ No account needed</p>
            <p>✓ All data stored locally</p>
            <p>✓ Works offline</p>
            <p>✓ Private and secure</p>
          </div>
          
          <button
            onClick={onClose}
            className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
          >
            Get Started
          </button>
        </div>
      </div>
    </div>
  )
}
