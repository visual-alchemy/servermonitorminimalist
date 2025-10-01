export const SHORTCUT_ICON_VALUES = ["gallery", "movie", "globe", "terminal"] as const

export type ShortcutIcon = (typeof SHORTCUT_ICON_VALUES)[number]

export type Shortcut = {
  id: string
  title: string
  url: string
  icon: ShortcutIcon
}

export type ShortcutInput = {
  title: string
  url: string
  icon: ShortcutIcon
}

export const DEFAULT_SHORTCUT_ICON: ShortcutIcon = "gallery"

export function isShortcutIcon(value: unknown): value is ShortcutIcon {
  return typeof value === "string" && (SHORTCUT_ICON_VALUES as readonly string[]).includes(value)
}

export function ensureUrlScheme(url: string): string {
  if (!url) {
    return ""
  }
  return /^https?:\/\//i.test(url) ? url : `https://${url}`
}

export function normalizeShortcutInput(input: ShortcutInput): ShortcutInput {
  return {
    title: input.title.trim(),
    url: ensureUrlScheme(input.url.trim()),
    icon: input.icon,
  }
}

export function isShortcut(value: unknown): value is Shortcut {
  if (!value || typeof value !== "object") {
    return false
  }

  const shortcut = value as Partial<Shortcut>
  return (
    typeof shortcut.id === "string" &&
    typeof shortcut.title === "string" &&
    typeof shortcut.url === "string" &&
    isShortcutIcon(shortcut.icon)
  )
}
