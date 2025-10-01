"use client"

import useSWR from "swr"
import { MetricCard } from "@/components/metric-card"
import { NetworkCard } from "@/components/network-card"
import { ThemeToggle } from "@/components/theme-toggle"

type MetricsResponse = {
  cpu: { usage: number }
  gpu: { usage: number }
  ram: { usedPct: number }
  disk: { usedPct: number; usedGB: number; totalGB: number }
  network: { inMBps: number; outMBps: number }
  extra: { loadAvg: number; uptimeHours: number }
  ts: number
}

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function Page() {
  const { data, isLoading } = useSWR<MetricsResponse>("/api/metrics", fetcher, {
    refreshInterval: 2000,
  })

  const skeleton = (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="rounded-lg border border-border bg-card p-4 h-28 animate-pulse" />
      ))}
    </div>
  )

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
        <MetricCard id="ram" title="RAM Used" value={data.ram.usedPct} unit="%" />
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
              <dd className="tabular-nums">{data.extra.uptimeHours}h</dd>
            </div>
          </dl>
        </section>
      </section>
    </main>
  )
}
