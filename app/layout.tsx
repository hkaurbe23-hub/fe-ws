import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Providers } from "./providers"
import { FloorsProvider } from "@/lib/floor-context"
import "./globals.css"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })

export const metadata: Metadata = {
  title: "WattSense - Energy Monitoring Platform",
  description: "Industrial energy telemetry and board management dashboard",
}

export const viewport: Viewport = {
  themeColor: "#3b82f6",
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased min-h-screen bg-background`}>
        <Providers>
          <FloorsProvider>
            {children}
          </FloorsProvider>
        </Providers>
        <Analytics />
      </body>
    </html>
  )
}