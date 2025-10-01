import os from "os"
import si from "systeminformation"

export type MetricsResponse = {
  cpu: { usage: number }
  gpu: { usage: number }
  ram: { usedPct: number; usedGB: number; totalGB: number }
  disk: { usedPct: number; usedGB: number; totalGB: number }
  network: { inMBps: number; outMBps: number }
  extra: { loadAvg: number; uptimeHours: number }
  ts: number
}

const BYTES_PER_GB = 1024 ** 3
const BYTES_PER_MB = 1024 ** 2

const clamp = (value: number, min = 0, max = 100) => Math.min(Math.max(value, min), max)

function roundTo(value: number, digits: number) {
  const factor = 10 ** digits
  return Math.round(value * factor) / factor
}

export async function getSystemMetrics(): Promise<MetricsResponse> {
  const [load, mem, graphics, fsSize, networkStats] = await Promise.all([
    si.currentLoad(),
    si.mem(),
    si.graphics(),
    si.fsSize(),
    si.networkStats(),
  ])

  const cpuUsage = clamp(load.currentLoad)

  const gpuControllers = graphics.controllers ?? []
  const gpuLoads = gpuControllers
    .map((controller) => controller.utilizationGpu)
    .filter((value): value is number => typeof value === "number" && Number.isFinite(value))

  const gpuUsage = gpuLoads.length > 0 ? clamp(gpuLoads.reduce((sum, value) => sum + value, 0) / gpuLoads.length) : 0

  const totalMemory = mem.total || 0
  const usedMemory = totalMemory ? totalMemory - mem.available : 0
  const ramUsedPct = totalMemory ? clamp((usedMemory / totalMemory) * 100) : 0
  const ramUsedGB = usedMemory / BYTES_PER_GB
  const ramTotalGB = totalMemory / BYTES_PER_GB

  const diskTotals = fsSize.reduce(
    (acc, volume) => {
      const total = typeof volume.size === "number" ? volume.size : 0
      const used = typeof volume.used === "number" ? volume.used : 0
      return {
        total: acc.total + total,
        used: acc.used + used,
      }
    },
    { total: 0, used: 0 },
  )

  const diskUsedPct = diskTotals.total ? clamp((diskTotals.used / diskTotals.total) * 100) : 0
  const diskUsedGB = diskTotals.used / BYTES_PER_GB
  const diskTotalGB = diskTotals.total / BYTES_PER_GB

  const aggregatedNet = networkStats.reduce(
    (acc, iface) => {
      const rx = typeof iface.rx_sec === "number" ? iface.rx_sec : 0
      const tx = typeof iface.tx_sec === "number" ? iface.tx_sec : 0
      return {
        inBytes: acc.inBytes + rx,
        outBytes: acc.outBytes + tx,
      }
    },
    { inBytes: 0, outBytes: 0 },
  )

  const networkInMBps = aggregatedNet.inBytes / BYTES_PER_MB
  const networkOutMBps = aggregatedNet.outBytes / BYTES_PER_MB

  const [loadAvg] = os.loadavg()
  const uptimeHours = Math.floor(os.uptime() / 3600)

  return {
    cpu: { usage: roundTo(cpuUsage, 1) },
    gpu: { usage: roundTo(gpuUsage, 1) },
    ram: {
      usedPct: roundTo(ramUsedPct, 1),
      usedGB: Math.round(ramUsedGB),
      totalGB: Math.round(ramTotalGB),
    },
    disk: {
      usedPct: roundTo(diskUsedPct, 1),
      usedGB: Math.round(diskUsedGB),
      totalGB: Math.round(diskTotalGB),
    },
    network: {
      inMBps: roundTo(networkInMBps, 2),
      outMBps: roundTo(networkOutMBps, 2),
    },
    extra: {
      loadAvg: roundTo(loadAvg, 2),
      uptimeHours,
    },
    ts: Date.now(),
  }
}
