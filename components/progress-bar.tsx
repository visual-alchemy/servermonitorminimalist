import { cn } from "@/lib/utils"

type ProgressBarProps = {
  value: number
  className?: string
  label?: string
  id?: string
}

export function ProgressBar({ value, className, label, id }: ProgressBarProps) {
  const v = Math.max(0, Math.min(100, value))
  const labelId = id ? `${id}-label` : undefined

  return (
    <div className={cn("w-full", className)}>
      {label ? (
        <div id={labelId} className="mb-1 text-xs text-muted-foreground">
          {label}
        </div>
      ) : null}
      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={v}
        aria-labelledby={labelId}
        className="h-2 w-full rounded-md border border-border bg-secondary"
      >
        <div className="h-full rounded-[5px] bg-foreground transition-[width]" style={{ width: `${v}%` }} />
      </div>
    </div>
  )
}
