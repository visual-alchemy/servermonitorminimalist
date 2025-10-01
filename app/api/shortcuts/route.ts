import { NextResponse } from "next/server"

import { createShortcut, getShortcuts } from "@/lib/shortcuts-store"
import { ensureUrlScheme, isShortcutIcon, type ShortcutInput } from "@/lib/shortcuts-types"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

function parseShortcut(body: unknown): ShortcutInput | null {
  if (!body || typeof body !== "object") {
    return null
  }

  const candidate = body as Record<string, unknown>
  const title = typeof candidate.title === "string" ? candidate.title.trim() : ""
  const url = typeof candidate.url === "string" ? candidate.url.trim() : ""
  const iconRaw = candidate.icon

  if (!title || !url || !isShortcutIcon(iconRaw)) {
    return null
  }

  return {
    title,
    url: ensureUrlScheme(url),
    icon: iconRaw,
  }
}

export async function GET() {
  const shortcuts = await getShortcuts()
  return NextResponse.json(shortcuts, {
    headers: {
      "Cache-Control": "no-store",
    },
  })
}

export async function POST(request: Request) {
  try {
    const payload = parseShortcut(await request.json())
    if (!payload) {
      return NextResponse.json({ error: "Invalid shortcut payload" }, { status: 400 })
    }
    const shortcut = await createShortcut(payload)
    return NextResponse.json(shortcut, { status: 201 })
  } catch (error) {
    console.error("Failed to create shortcut", error)
    return NextResponse.json({ error: "Unable to save shortcut" }, { status: 500 })
  }
}
