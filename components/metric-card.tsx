import { cn } from "@/lib/utils"
import { ProgressBar } from "./progress-bar"

type MetricCardProps = {
  title: string
  value: number
  unit?: string
  showBar?: boolean
  className?: string
  id?: string
  progressLabel?: string
}

export function MetricCard({ title, value, unit, showBar = true, className, id, progressLabel }: MetricCardProps) {
  return (
    <section
      className={cn("rounded-lg border border-border bg-card p-4", "flex flex-col gap-3", className)}
      aria-labelledby={id ? `${id}-title` : undefined}
    >
      <header className="flex items-center justify-between">
        <h3 id={id ? `${id}-title` : undefined} className="text-sm text-muted-foreground">
          {title}
        </h3>
        <div className="text-xl font-medium tracking-tight">
          {value}
          {unit ? <span className="ml-1 text-sm text-muted-foreground">{unit}</span> : null}
        </div>
      </header>
      {showBar ? <ProgressBar value={Math.round(value)} id={id} label={progressLabel} /> : null}
    </section>
  )
}
