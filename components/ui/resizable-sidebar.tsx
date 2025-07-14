"use client"

import type React from "react"

import { useState, useRef, useCallback, useEffect } from "react"
import { GripVertical } from "lucide-react"

interface ResizableSidebarProps {
  children: React.ReactNode
  defaultWidth?: number
  minWidth?: number
  maxWidth?: number
  className?: string
}

export default function ResizableSidebar({
  children,
  defaultWidth = 320,
  minWidth = 280,
  maxWidth = 500,
  className = "",
}: ResizableSidebarProps) {
  const [width, setWidth] = useState(defaultWidth)
  const [isResizing, setIsResizing] = useState(false)
  const sidebarRef = useRef<HTMLDivElement>(null)
  const startX = useRef(0)
  const startWidth = useRef(0)

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      setIsResizing(true)
      startX.current = e.clientX
      startWidth.current = width

      // Prevent text selection during resize
      document.body.style.userSelect = "none"
      document.body.style.cursor = "col-resize"
    },
    [width],
  )

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isResizing) return

      const deltaX = e.clientX - startX.current
      const newWidth = Math.min(Math.max(startWidth.current + deltaX, minWidth), maxWidth)
      setWidth(newWidth)
    },
    [isResizing, minWidth, maxWidth],
  )

  const handleMouseUp = useCallback(() => {
    setIsResizing(false)
    document.body.style.userSelect = ""
    document.body.style.cursor = ""
  }, [])

  useEffect(() => {
    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)

      return () => {
        document.removeEventListener("mousemove", handleMouseMove)
        document.removeEventListener("mouseup", handleMouseUp)
      }
    }
  }, [isResizing, handleMouseMove, handleMouseUp])

  // Handle responsive behavior
  useEffect(() => {
    const handleResize = () => {
      const screenWidth = window.innerWidth

      // On mobile/tablet, use fixed smaller width
      if (screenWidth < 768) {
        setWidth(Math.min(280, screenWidth - 40))
      } else if (screenWidth < 1024) {
        // On tablet, ensure sidebar doesn't take too much space
        const maxResponsiveWidth = Math.min(maxWidth, screenWidth * 0.4)
        if (width > maxResponsiveWidth) {
          setWidth(maxResponsiveWidth)
        }
      }
    }

    window.addEventListener("resize", handleResize)
    handleResize() // Call once on mount

    return () => window.removeEventListener("resize", handleResize)
  }, [width, maxWidth])

  return (
    <div ref={sidebarRef} className={`relative flex-shrink-0 ${className}`} style={{ width: `${width}px` }}>
      {children}

      {/* Resize Handle */}
      <div
        className={`absolute top-0 right-0 w-1 h-full cursor-col-resize group hover:w-2 transition-all duration-200 ${
          isResizing ? "w-2" : ""
        }`}
        onMouseDown={handleMouseDown}
      >
        {/* Visual indicator */}
        <div
          className={`absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity ${
            isResizing ? "opacity-100" : ""
          }`}
        />

        {/* Grip icon */}
        <div
          className={`absolute top-1/2 -translate-y-1/2 -right-2 bg-white/10 backdrop-blur-sm rounded-full p-1 opacity-0 group-hover:opacity-100 transition-all duration-200 ${
            isResizing ? "opacity-100 bg-white/20" : ""
          }`}
        >
          <GripVertical className="h-3 w-3 text-white/70" />
        </div>
      </div>

      {/* Resize overlay for better UX during resize */}
      {isResizing && <div className="fixed inset-0 z-50 cursor-col-resize" style={{ pointerEvents: "all" }} />}
    </div>
  )
}
