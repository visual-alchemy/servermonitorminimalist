import type React from "react"
import type { Metadata } from "next"
import localFont from "next/font/local"
import { GeistMono } from "geist/font/mono"
import "./globals.css"

const Doto = localFont({
  src: "../public/fonts/doto/Doto_Rounded-Bold.ttf",
  variable: "--font-doto",
  display: "swap",
  weight: "700",
})

export const metadata: Metadata = {
  title: "v0 App",
  description: "Created with v0",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${Doto.variable} ${GeistMono.variable} antialiased dark`}>
      <body className="font-sans">{children}</body>
    </html>
  )
}
