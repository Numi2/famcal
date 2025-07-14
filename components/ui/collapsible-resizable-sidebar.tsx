"use client"

import type React from "react"

import { useState, useRef, useCallback, useEffect } from "react"
import { GripVertical, ChevronLeft, ChevronRight, Menu } from "lucide-react"

interface CollapsibleResizableSidebarProps {
  children: React.ReactNode
  defaultWidth?: number
  minWidth?: number
  maxWidth?: number
  collapsedWidth?: number
  className?: string
  onWidthChange?: (width: number) => void
  onCollapseChange?: (collapsed: boolean) => void
}

export default function CollapsibleResizableSidebar({
  children,
  defaultWidth = 320,
  minWidth = 280,
  maxWidth = 500,
  collapsedWidth = 60,
  className = "",
  onWidthChange,
  onCollapseChange,
}: CollapsibleResizableSidebarProps) {
  const [width, setWidth] = useState(defaultWidth)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [isHovering, setIsHovering] = useState(false)
  const [lastExpandedWidth, setLastExpandedWidth] = useState(defaultWidth)

  const sidebarRef = useRef<HTMLDivElement>(null)
  const startX = useRef(0)
  const startWidth = useRef(0)
  const resizeTimeoutRef = useRef<NodeJS.Timeout>()

  // Touch handling
  const [touchStartX, setTouchStartX] = useState(0)
  const [touchStartWidth, setTouchStartWidth] = useState(0)
  const [isTouching, setIsTouching] = useState(false)

  const currentWidth = isCollapsed ? collapsedWidth : width

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (isCollapsed) return

      setIsResizing(true)
      startX.current = e.clientX
      startWidth.current = width

      // Prevent text selection during resize
      document.body.style.userSelect = "none"
      document.body.style.cursor = "col-resize"
    },
    [width, isCollapsed],
  )

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (isCollapsed) return

      const touch = e.touches[0]
      setIsTouching(true)
      setTouchStartX(touch.clientX)
      setTouchStartWidth(width)

      // Prevent scrolling during resize
      e.preventDefault()
    },
    [width, isCollapsed],
  )

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isResizing || isCollapsed) return

      const deltaX = e.clientX - startX.current
      const newWidth = Math.min(Math.max(startWidth.current + deltaX, minWidth), maxWidth)
      setWidth(newWidth)
      onWidthChange?.(newWidth)
    },
    [isResizing, isCollapsed, minWidth, maxWidth, onWidthChange],
  )

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!isTouching || isCollapsed) return

      const touch = e.touches[0]
      const deltaX = touch.clientX - touchStartX
      const newWidth = Math.min(Math.max(touchStartWidth + deltaX, minWidth), maxWidth)
      setWidth(newWidth)
      onWidthChange?.(newWidth)

      // Prevent scrolling
      e.preventDefault()
    },
    [isTouching, isCollapsed, touchStartX, touchStartWidth, minWidth, maxWidth, onWidthChange],
  )

  const handleMouseUp = useCallback(() => {
    setIsResizing(false)
    document.body.style.userSelect = ""
    document.body.style.cursor = ""
  }, [])

  const handleTouchEnd = useCallback(() => {
    setIsTouching(false)
  }, [])

  const toggleCollapse = useCallback(() => {
    if (isCollapsed) {
      setLastExpandedWidth(width)
      setWidth(lastExpandedWidth)
      setIsCollapsed(false)
      onCollapseChange?.(false)
      onWidthChange?.(lastExpandedWidth)
    } else {
      setLastExpandedWidth(width)
      setIsCollapsed(true)
      onCollapseChange?.(true)
      onWidthChange?.(collapsedWidth)
    }
  }, [isCollapsed, width, lastExpandedWidth, collapsedWidth, onCollapseChange, onWidthChange])

  // Mouse event listeners
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

  // Touch event listeners
  useEffect(() => {
    if (isTouching) {
      document.addEventListener("touchmove", handleTouchMove, { passive: false })
      document.addEventListener("touchend", handleTouchEnd)

      return () => {
        document.removeEventListener("touchmove", handleTouchMove)
        document.removeEventListener("touchend", handleTouchEnd)
      }
    }
  }, [isTouching, handleTouchMove, handleTouchEnd])

  // Handle responsive behavior
  useEffect(() => {
    const handleResize = () => {
      const screenWidth = window.innerWidth
      const wasMobile = isMobile
      const nowMobile = screenWidth < 768

      setIsMobile(nowMobile)

      // Auto-collapse on mobile if not already collapsed
      if (nowMobile && !wasMobile && !isCollapsed) {
        setLastExpandedWidth(width)
        setIsCollapsed(true)
        onCollapseChange?.(true)
        onWidthChange?.(collapsedWidth)
      }

      // Auto-expand on desktop if was auto-collapsed
      else if (!nowMobile && wasMobile && isCollapsed) {
        setIsCollapsed(false)
        setWidth(lastExpandedWidth)
        onCollapseChange?.(false)
        onWidthChange?.(lastExpandedWidth)
      }

      // Adjust width constraints for different screen sizes
      else if (!isCollapsed) {
        if (nowMobile) {
          const maxMobileWidth = Math.min(280, screenWidth - 40)
          if (width > maxMobileWidth) {
            setWidth(maxMobileWidth)
            onWidthChange?.(maxMobileWidth)
          }
        } else if (screenWidth < 1024) {
          const maxTabletWidth = Math.min(maxWidth, screenWidth * 0.4)
          if (width > maxTabletWidth) {
            setWidth(maxTabletWidth)
            onWidthChange?.(maxTabletWidth)
          }
        }
      }
    }

    // Debounce resize events
    const debouncedResize = () => {
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current)
      }
      resizeTimeoutRef.current = setTimeout(handleResize, 100)
    }

    window.addEventListener("resize", debouncedResize)
    handleResize() // Call once on mount

    return () => {
      window.removeEventListener("resize", debouncedResize)
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current)
      }
    }
  }, [width, maxWidth, isCollapsed, isMobile, lastExpandedWidth, collapsedWidth, onCollapseChange, onWidthChange])

  return (
    <div
      ref={sidebarRef}
      className={`relative flex-shrink-0 transition-all duration-300 ease-in-out ${className}`}
      style={{ width: `${currentWidth}px` }}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Sidebar Content */}
      <div
        className={`h-full overflow-hidden transition-opacity duration-300 ${isCollapsed ? "opacity-0" : "opacity-100"}`}
      >
        {!isCollapsed && children}
      </div>

      {/* Collapsed State Content */}
      {isCollapsed && (
        <div className="h-full flex flex-col items-center py-4 space-y-4">
          {/* Collapse Toggle Button */}
          <button
            onClick={toggleCollapse}
            className="p-3 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all duration-200 group"
            aria-label="Expand sidebar"
          >
            <Menu className="h-5 w-5 text-white group-hover:scale-110 transition-transform" />
          </button>

          {/* Collapsed indicators - could show family member avatars */}
          <div className="flex flex-col space-y-2">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-sm animate-pulse"
                style={{ animationDelay: `${i * 0.2}s` }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Resize Handle */}
      {!isCollapsed && (
        <div
          className={`absolute top-0 right-0 w-2 h-full cursor-col-resize group hover:w-3 transition-all duration-200 ${
            isResizing || isTouching ? "w-3" : ""
          } ${isMobile ? "w-4 hover:w-5" : ""}`}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
        >
          {/* Visual indicator */}
          <div
            className={`absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity ${
              isResizing || isTouching ? "opacity-100" : ""
            }`}
          />

          {/* Grip icon */}
          <div
            className={`absolute top-1/2 -translate-y-1/2 -right-2 bg-white/10 backdrop-blur-sm rounded-full p-1 opacity-0 group-hover:opacity-100 transition-all duration-200 ${
              isResizing || isTouching ? "opacity-100 bg-white/20" : ""
            } ${isMobile ? "p-2 -right-3" : ""}`}
          >
            <GripVertical className={`text-white/70 ${isMobile ? "h-4 w-4" : "h-3 w-3"}`} />
          </div>
        </div>
      )}

      {/* Collapse Toggle Button (when expanded) */}
      {!isCollapsed && (
        <button
          onClick={toggleCollapse}
          className={`absolute top-4 -right-3 p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all duration-200 z-10 ${
            isHovering || isMobile ? "opacity-100" : "opacity-0"
          } ${isMobile ? "opacity-100 -right-4 p-3" : ""}`}
          aria-label="Collapse sidebar"
        >
          <ChevronLeft className={`text-white ${isMobile ? "h-5 w-5" : "h-4 w-4"}`} />
        </button>
      )}

      {/* Expand Button (when collapsed) */}
      {isCollapsed && (
        <button
          onClick={toggleCollapse}
          className={`absolute top-4 -right-3 p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all duration-200 z-10 ${
            isMobile ? "-right-4 p-3" : ""
          }`}
          aria-label="Expand sidebar"
        >
          <ChevronRight className={`text-white ${isMobile ? "h-5 w-5" : "h-4 w-4"}`} />
        </button>
      )}

      {/* Resize overlay for better UX during resize */}
      {(isResizing || isTouching) && (
        <div className="fixed inset-0 z-50 cursor-col-resize" style={{ pointerEvents: "all" }} />
      )}
    </div>
  )
}
