"use client"

import type React from "react"

import { useState, useEffect } from "react"

interface ResponsiveGridProps {
  children: React.ReactNode
  sidebarWidth: number
  className?: string
}

export default function ResponsiveGrid({ children, sidebarWidth, className = "" }: ResponsiveGridProps) {
  const [screenWidth, setScreenWidth] = useState(0)

  useEffect(() => {
    const handleResize = () => {
      setScreenWidth(window.innerWidth)
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // Calculate available space for content
  const availableWidth = screenWidth - sidebarWidth

  // Determine grid columns based on available space
  const getGridCols = () => {
    if (availableWidth < 600) return 1
    if (availableWidth < 900) return 2
    if (availableWidth < 1200) return 3
    return 4
  }

  const gridCols = getGridCols()

  return (
    <div
      className={`grid gap-4 ${className}`}
      style={{
        gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))`,
      }}
    >
      {children}
    </div>
  )
}
