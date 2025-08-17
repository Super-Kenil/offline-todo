"use client"
import type React from "react"
// import type { Metadata } from "next"
import { DM_Sans } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import "./globals.css"

const dmSans = DM_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-dm-sans",
  weight: ["400", "500", "600", "700", "800", "900"],
})

// export const metadata: Metadata = {
//   title: "TaskFlow - Local-First Todo App",
//   description: "A modern, offline-capable todo application with reminders and notifications",
//   generator: "v0.app",
//   manifest: "/manifest.json",
//   themeColor: [
//     { media: "(prefers-color-scheme: light)", color: "#be123c" },
//     { media: "(prefers-color-scheme: dark)", color: "#f43f5e" },
//   ],
//   // viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no",
//   appleWebApp: {
//     capable: true,
//     statusBarStyle: "default",
//     title: "TaskFlow",
//   },
// }

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <style>{`
html {
  font-family: ${dmSans.style.fontFamily};
  --font-dm-sans: ${dmSans.variable};
}
        `}</style>
      </head>
      <body className={dmSans.variable}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
