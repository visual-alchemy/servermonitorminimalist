"use client"

import { useState } from "react"
import type { FormEvent } from "react"
import useSWR from "swr"
import { MetricCard } from "@/components/metric-card"
import { NetworkCard } from "@/components/network-card"
import { ThemeToggle } from "@/components/theme-toggle"
import type { MetricsResponse } from "@/lib/system-metrics"
import {
  DEFAULT_SHORTCUT_ICON,
  ensureUrlScheme,
  type Shortcut,
  type ShortcutIcon,
} from "@/lib/shortcuts-types"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  ArrowUpRightIcon,
  ClapperboardIcon,
  Globe2Icon,
  ImageIcon,
  PencilIcon,
  PlusIcon,
  ServerIcon,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

const formatUptime = (totalHours: number) => {
  const days = Math.floor(totalHours / 24)
  const hours = totalHours % 24

  if (days <= 0) {
    return `${hours}h`
  }

  if (hours === 0) {
    return `${days}d`
  }

  return `${days}d ${hours}h`
}

const ICON_OPTIONS: Array<{ value: ShortcutIcon; label: string; Icon: LucideIcon }> = [
  { value: "gallery", label: "Gallery", Icon: ImageIcon },
  { value: "movie", label: "Movie", Icon: ClapperboardIcon },
  { value: "globe", label: "Globe", Icon: Globe2Icon },
  { value: "terminal", label: "Terminal", Icon: ServerIcon },
]

const ICON_MAP: Record<ShortcutIcon, LucideIcon> = ICON_OPTIONS.reduce(
  (acc, option) => {
    acc[option.value] = option.Icon
    return acc
  },
  {} as Record<ShortcutIcon, LucideIcon>,
)

export default function Page() {
  const { data, error, isLoading } = useSWR<MetricsResponse>("/api/metrics", fetcher, {
    refreshInterval: 2000,
  })

  const {
    data: shortcutsData,
    error: shortcutsError,
    isLoading: shortcutsLoading,
    mutate: mutateShortcuts,
  } = useSWR<Shortcut[]>("/api/shortcuts", fetcher)

  const shortcuts = shortcutsData ?? []
  const shortcutsEmpty = !shortcutsLoading && shortcuts.length === 0

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingShortcut, setEditingShortcut] = useState<Shortcut | null>(null)
  const [formState, setFormState] = useState<{ title: string; url: string; icon: ShortcutIcon }>(
    () => ({ title: "", url: "", icon: DEFAULT_SHORTCUT_ICON }),
  )
  const [formError, setFormError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const resetForm = () => {
    setFormState({ title: "", url: "", icon: DEFAULT_SHORTCUT_ICON })
    setEditingShortcut(null)
    setFormError(null)
  }

  const handleDialogOpenChange = (open: boolean) => {
    setDialogOpen(open)
    if (!open) {
      resetForm()
    }
  }

  const handleAddShortcut = () => {
    resetForm()
    setDialogOpen(true)
  }

  const handleEditShortcut = (shortcut: Shortcut) => {
    setEditingShortcut(shortcut)
    setFormState({ title: shortcut.title, url: shortcut.url, icon: shortcut.icon })
    setFormError(null)
    setDialogOpen(true)
  }

  const handleFormSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (isSaving) {
      return
    }

    const title = formState.title.trim()
    const url = ensureUrlScheme(formState.url.trim())
    const icon = formState.icon

    if (!title || !url) {
      setFormError("Title and URL are required")
      return
    }

    setFormError(null)
    setIsSaving(true)

    const payload = JSON.stringify({ title, url, icon })
    const requestInit: RequestInit = {
      method: editingShortcut ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: payload,
    }

    const endpoint = editingShortcut ? `/api/shortcuts/${editingShortcut.id}` : "/api/shortcuts"

    try {
      const response = await fetch(endpoint, requestInit)
      if (!response.ok) {
        console.error("Failed to save shortcut", await response.text())
        setFormError("Unable to save shortcut. Please try again.")
        return
      }

      await mutateShortcuts()
      handleDialogOpenChange(false)
    } catch (apiError) {
      console.error("Shortcut save failed", apiError)
      setFormError("Unable to save shortcut. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }

  const openShortcut = (shortcut: Shortcut) => {
    if (typeof window === "undefined") {
      return
    }
    const targetUrl = ensureUrlScheme(shortcut.url)
    window.open(targetUrl, "_blank", "noopener,noreferrer")
  }

  const skeleton = (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="rounded-lg border border-border bg-card p-4 h-28 animate-pulse" />
      ))}
    </div>
  )

  if (error) {
    return (
      <main className="mx-auto max-w-6xl p-4 md:p-6 lg:p-8">
        <header className="mb-6 flex flex-col gap-3">
          <div className="flex items-center">
            <ThemeToggle />
          </div>
          <div>
            <h1 className="text-balance text-2xl font-medium tracking-tight">Server Monitor</h1>
            <p className="text-sm text-muted-foreground">Minimalist black & white dashboard</p>
          </div>
        </header>
        <section className="rounded-lg border border-border bg-card p-6 text-sm text-muted-foreground">
          Unable to load system metrics right now. Please try again in a moment.
        </section>
      </main>
    )
  }

  if (!data || isLoading) {
    return (
      <main className="mx-auto max-w-6xl p-4 md:p-6 lg:p-8">
        <header className="mb-6 flex flex-col gap-3">
          {/* top-left theme toggle */}
          <div className="flex items-center">
            <ThemeToggle />
          </div>
          <div>
            <h1 className="text-balance text-2xl font-medium tracking-tight">Server Monitor</h1>
            <p className="text-sm text-muted-foreground">Minimalist black & white dashboard</p>
          </div>
        </header>
        {skeleton}
      </main>
    )
  }

  return (
    <>
      <main className="mx-auto max-w-6xl p-4 md:p-6 lg:p-8">
        <header className="mb-6 flex flex-col gap-3">
          {/* top-left theme toggle */}
          <div className="flex items-center">
            <ThemeToggle />
          </div>
          <div>
            <h1 className="text-balance text-2xl font-medium tracking-tight">Server Monitor</h1>
            <p className="text-sm text-muted-foreground">
              Minimalist black & white dashboard • Updated {new Date(data.ts).toLocaleTimeString()}
            </p>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <MetricCard id="cpu" title="CPU" value={data.cpu.usage} unit="%" />
          <MetricCard id="gpu" title="GPU" value={data.gpu.usage} unit="%" />
          <MetricCard
            id="ram"
            title="RAM Used"
            value={data.ram.usedPct}
            unit="%"
            progressLabel={`${data.ram.usedGB} GB / ${data.ram.totalGB} GB`}
          />
          <MetricCard
            id="disk"
            title="Disk Used"
            value={data.disk.usedPct}
            unit="%"
            progressLabel={`${data.disk.usedGB} GB / ${data.disk.totalGB} GB`}
          />
          <NetworkCard inMBps={data.network.inMBps} outMBps={data.network.outMBps} />
          <section className="rounded-lg border border-border bg-card p-4 flex flex-col gap-3">
            <header className="flex items-center justify-between">
              <h3 className="text-sm text-muted-foreground">System</h3>
            </header>
            <dl className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex items-center justify-between">
                <dt className="text-muted-foreground">Load Avg</dt>
                <dd className="tabular-nums">{data.extra.loadAvg.toFixed(2)}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-muted-foreground">Uptime</dt>
                <dd className="tabular-nums">{formatUptime(data.extra.uptimeHours)}</dd>
              </div>
            </dl>
          </section>
        </section>

        <section className="mt-8 rounded-lg border border-border bg-card p-4 flex flex-col gap-4">
          <header className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-base font-medium tracking-tight">Shortcuts</h3>
              <p className="text-sm text-muted-foreground">Quick access to the tools and dashboards you need most.</p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddShortcut}
              className="self-start sm:self-auto"
            >
              <PlusIcon className="mr-2 size-4" /> Add shortcut
            </Button>
          </header>
          {shortcutsError ? (
            <p className="text-sm text-destructive">Failed to load shortcuts. Please refresh the page.</p>
          ) : shortcutsLoading ? (
            <p className="text-sm text-muted-foreground">Loading shortcuts…</p>
          ) : shortcutsEmpty ? (
            <p className="text-sm text-muted-foreground">No shortcuts yet. Create one to launch a link in a single click.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {shortcuts.map((shortcut) => {
                const IconComponent = ICON_MAP[shortcut.icon] ?? ICON_MAP[DEFAULT_SHORTCUT_ICON]
                return (
                  <div key={shortcut.id} className="flex items-center gap-1">
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => openShortcut(shortcut)}
                      className="flex items-center gap-2"
                    >
                      <IconComponent className="size-4" />
                      <span>{shortcut.title}</span>
                      <ArrowUpRightIcon className="size-3.5" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-8"
                      onClick={() => handleEditShortcut(shortcut)}
                      aria-label={`Edit ${shortcut.title}`}
                    >
                      <PencilIcon className="size-4" />
                    </Button>
                  </div>
                )
              })}
            </div>
          )}
        </section>
      </main>

      <Dialog open={dialogOpen} onOpenChange={handleDialogOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingShortcut ? "Edit shortcut" : "Add shortcut"}</DialogTitle>
            <DialogDescription>Give your shortcut a title, destination URL, and an icon.</DialogDescription>
          </DialogHeader>
          <form className="space-y-4" onSubmit={handleFormSubmit}>
            <div className="space-y-2">
              <Label htmlFor="shortcut-title">Title</Label>
              <Input
                id="shortcut-title"
                value={formState.title}
                onChange={(event) => setFormState((prev) => ({ ...prev, title: event.target.value }))}
                placeholder="Status page"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="shortcut-url">URL</Label>
              <Input
                id="shortcut-url"
                type="url"
                inputMode="url"
                value={formState.url}
                onChange={(event) => setFormState((prev) => ({ ...prev, url: event.target.value }))}
                placeholder="https://example.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Icon</Label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {ICON_OPTIONS.map(({ value, label, Icon }) => {
                  const selected = formState.icon === value
                  return (
                    <button
                      key={value}
                      type="button"
                      className={`flex items-center gap-2 rounded-md border border-border bg-card p-3 text-sm transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${
                        selected ? "border-foreground" : "hover:border-foreground/40"
                      }`}
                      onClick={() => setFormState((prev) => ({ ...prev, icon: value }))}
                      aria-pressed={selected}
                    >
                      <Icon className="size-4" />
                      <span>{label}</span>
                    </button>
                  )
                })}
              </div>
            </div>
            {formError ? <p className="text-sm text-destructive">{formError}</p> : null}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => handleDialogOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? "Saving..." : editingShortcut ? "Save changes" : "Add shortcut"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
