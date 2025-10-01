import { NextResponse } from "next/server"

import { updateShortcut } from "@/lib/shortcuts-store"
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

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const id = params.id

  if (!id) {
    return NextResponse.json({ error: "Shortcut id is required" }, { status: 400 })
  }

  try {
    const payload = parseShortcut(await request.json())
    if (!payload) {
      return NextResponse.json({ error: "Invalid shortcut payload" }, { status: 400 })
    }

    const updated = await updateShortcut(id, payload)
    if (!updated) {
      return NextResponse.json({ error: "Shortcut not found" }, { status: 404 })
    }

    return NextResponse.json(updated)
  } catch (error) {
    console.error(`Failed to update shortcut ${id}`, error)
    return NextResponse.json({ error: "Unable to update shortcut" }, { status: 500 })
  }
}
