import { NextResponse } from "next/server"

function clamp(n: number, min = 0, max = 100) {
  return Math.min(Math.max(n, min), max)
}

function randPercent(base = 50, spread = 50) {
  const v = base + (Math.random() * 2 - 1) * spread
  return Math.round(clamp(v))
}

function randThroughput(maxMBps = 125) {
  // up to ~1 Gbps ~ 125 MB/s for demo
  return +(Math.random() * maxMBps).toFixed(2)
}

export async function GET() {
  // Simulated metrics
  const cpu = randPercent(42, 40) // %
  const gpu = randPercent(30, 50) // %
  const ramUsedPct = randPercent(58, 30) // %
  const diskUsedPct = randPercent(61, 25) // %
  const netIn = randThroughput()
  const netOut = randThroughput()

  // Optional extras
  const loadAvg = +(0.2 + Math.random() * 2.4).toFixed(2)
  const uptimeHours = Math.floor(200 + Math.random() * 500)

  const TOTAL_DISK_GB = 1024
  const usedGB = Math.round((diskUsedPct / 100) * TOTAL_DISK_GB)

  return NextResponse.json({
    cpu: { usage: cpu },
    gpu: { usage: gpu },
    ram: { usedPct: ramUsedPct },
    disk: { usedPct: diskUsedPct, usedGB, totalGB: TOTAL_DISK_GB },
    network: { inMBps: netIn, outMBps: netOut },
    extra: { loadAvg, uptimeHours },
    ts: Date.now(),
  })
}
