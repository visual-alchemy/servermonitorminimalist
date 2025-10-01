import { NextResponse } from "next/server"

import { getSystemMetrics } from "@/lib/system-metrics"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const metrics = await getSystemMetrics()

    return NextResponse.json(metrics, {
      headers: {
        "Cache-Control": "no-store",
      },
    })
  } catch (error) {
    console.error("Failed to generate system metrics", error)
    return NextResponse.json({ error: "Failed to generate system metrics" }, { status: 500 })
  }
}
