"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false)
  const [isDark, setIsDark] = useState(false)

  // Initialize from localStorage or system preference
  useEffect(() => {
    setMounted(true)
    const stored = typeof window !== "undefined" ? localStorage.getItem("theme") : null
    const prefersDark =
      typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches

    const nextDark = stored ? stored === "dark" : prefersDark
    setIsDark(nextDark)
    if (typeof document !== "undefined") {
      document.documentElement.classList.toggle("dark", nextDark)
    }
  }, [])

  const toggle = () => {
    const next = !isDark
    setIsDark(next)
    if (typeof document !== "undefined") {
      document.documentElement.classList.toggle("dark", next)
    }
    if (typeof window !== "undefined") {
      localStorage.setItem("theme", next ? "dark" : "light")
    }
  }

  if (!mounted) {
    return (
      <Button variant="outline" size="sm" className="h-8 px-3 bg-transparent" aria-label="Toggle theme" disabled>
        Theme
      </Button>
    )
  }

  return (
    <Button
      variant="outline"
      size="sm"
      className="h-8 px-3 bg-transparent"
      onClick={toggle}
      aria-pressed={isDark}
      aria-label="Toggle theme"
    >
      {isDark ? "Dark" : "Light"}
    </Button>
  )
}
