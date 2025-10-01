import { cn } from "@/lib/utils"
import { ProgressBar } from "./progress-bar"

type NetworkCardProps = {
  inMBps: number
  outMBps: number
  className?: string
}

export function NetworkCard({ inMBps, outMBps, className }: NetworkCardProps) {
  // Map throughput to an indicative percentage (max 125 MB/s ~ 100%)
  const pct = (mbps: number) => Math.max(0, Math.min(100, (mbps / 125) * 100))
  return (
    <section className={cn("rounded-lg border border-border bg-card p-4 flex flex-col gap-3", className)}>
      <header className="flex items-center justify-between">
        <h3 className="text-sm text-muted-foreground">Network</h3>
        <div className="text-sm text-muted-foreground">MB/s</div>
      </header>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs">In</span>
          <span className="text-sm tabular-nums">{inMBps.toFixed(2)}</span>
        </div>
        <ProgressBar value={pct(inMBps)} />
        <div className="flex items-center justify-between">
          <span className="text-xs">Out</span>
          <span className="text-sm tabular-nums">{outMBps.toFixed(2)}</span>
        </div>
        <ProgressBar value={pct(outMBps)} />
      </div>
    </section>
  )
}
