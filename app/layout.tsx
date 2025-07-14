import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import FamilyCalendarAssistant from "@/components/ai-assistant/chat-ui"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Family Calendar",
  description: "make the most of your families time <3",
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
