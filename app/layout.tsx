import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import FamilyCalendarAssistant from "@/components/ai-assistant/chat-ui"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Lovy-tech | Family Calendar",
  description: "AI-powered family calendar to help families with small children organize their lives",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <FamilyCalendarAssistant />
      </body>
    </html>
  )
}
