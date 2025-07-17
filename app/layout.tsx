import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { LocalAuthProvider } from "@/lib/local-storage/auth-context"
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
        <LocalAuthProvider>
          <TimezoneProvider>
            {children}
          </TimezoneProvider>
        </LocalAuthProvider>
      </body>
    </html>
  )
}
