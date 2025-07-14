"use client"

import type React from "react"

import { useEffect } from "react"
import { X } from "lucide-react"

interface MobileSidebarOverlayProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
}

export default function MobileSidebarOverlay({ isOpen, onClose, children }: MobileSidebarOverlayProps) {
  // Prevent body scroll when overlay is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }

    return () => {
      document.body.style.overflow = ""
    }
  }, [isOpen])

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose()
      }
    }

    document.addEventListener("keydown", handleEscape)
    return () => document.removeEventListener("keydown", handleEscape)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Sidebar */}
      <div className="absolute left-0 top-0 h-full w-80 max-w-[85vw] bg-white/10 backdrop-blur-lg border-r border-white/20 transform transition-transform duration-300 ease-in-out">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors z-10"
          aria-label="Close sidebar"
        >
          <X className="h-5 w-5 text-white" />
        </button>

        {/* Content */}
        <div className="h-full pt-16">{children}</div>
      </div>
    </div>
  )
}
