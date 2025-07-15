import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { AuthProvider } from "@/lib/auth/auth-context"
import { TimezoneProvider } from "@/lib/hooks/use-timezone"

const inter = { className: 'font-sans' }

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
        <AuthProvider>
          <TimezoneProvider>
            {children}
          </TimezoneProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
