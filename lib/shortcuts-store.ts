import { randomUUID } from "crypto"
import fs from "fs/promises"
import path from "path"

import {
  DEFAULT_SHORTCUT_ICON,
  type Shortcut,
  type ShortcutInput,
  ensureUrlScheme,
  isShortcut,
  isShortcutIcon,
  normalizeShortcutInput,
} from "./shortcuts-types"

const DATA_DIR = path.join(process.cwd(), "data")
const DATA_FILE = path.join(DATA_DIR, "shortcuts.json")

async function ensureStoreFile() {
  await fs.mkdir(DATA_DIR, { recursive: true })
  try {
    await fs.access(DATA_FILE)
  } catch (error) {
    await fs.writeFile(DATA_FILE, "[]", "utf8")
  }
}

async function readStore(): Promise<Shortcut[]> {
  await ensureStoreFile()
  try {
    const raw = await fs.readFile(DATA_FILE, "utf8")
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) {
      return []
    }
    return parsed.filter(isShortcut).map((shortcut) => sanitizeShortcut(shortcut))
  } catch (error) {
    console.error("Failed to read shortcuts store", error)
    return []
  }
}

async function writeStore(shortcuts: Shortcut[]) {
  await ensureStoreFile()
  await fs.writeFile(DATA_FILE, `${JSON.stringify(shortcuts, null, 2)}\n`, "utf8")
}

function sanitizeShortcut(shortcut: Shortcut): Shortcut {
  return {
    id: shortcut.id,
    title: shortcut.title.trim(),
    url: ensureUrlScheme(shortcut.url.trim()),
    icon: isShortcutIcon(shortcut.icon) ? shortcut.icon : DEFAULT_SHORTCUT_ICON,
  }
}

export async function getShortcuts(): Promise<Shortcut[]> {
  return readStore()
}

export async function createShortcut(input: ShortcutInput): Promise<Shortcut> {
  const normalized = normalizeShortcutInput(input)
  const shortcuts = await readStore()
  const shortcut: Shortcut = {
    id: randomUUID(),
    ...normalized,
  }
  shortcuts.push(shortcut)
  await writeStore(shortcuts)
  return shortcut
}

export async function updateShortcut(id: string, input: ShortcutInput): Promise<Shortcut | null> {
  const normalized = normalizeShortcutInput(input)
  const shortcuts = await readStore()
  const index = shortcuts.findIndex((item) => item.id === id)

  if (index === -1) {
    return null
  }

  const updated: Shortcut = {
    ...shortcuts[index],
    ...normalized,
  }

  shortcuts[index] = updated
  await writeStore(shortcuts)
  return updated
}
