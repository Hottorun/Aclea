import { NextResponse } from "next/server"
import { deleteDeclinedLeadsOlderThan, getSettings } from "@/lib/supabase"

export async function POST(request: Request) {
  try {
    // Require a shared secret — fail closed if CRON_SECRET is not configured.
    // Set CRON_SECRET in your environment and pass it as: Authorization: Bearer <secret>
    const cronSecret = process.env.CRON_SECRET
    if (!cronSecret) {
      return NextResponse.json({ error: "Cron endpoint is not configured" }, { status: 500 })
    }
    const authHeader = request.headers.get("authorization")
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { teamId } = body as { teamId: string }

    if (!teamId) {
      return NextResponse.json({ error: "teamId is required" }, { status: 400 })
    }

    const settings = await getSettings(teamId)
    const days = settings.autoDeleteDeclinedDays

    if (days <= 0) {
      return NextResponse.json({
        success: true,
        message: "Auto-delete is disabled",
        deletedCount: 0
      })
    }

    const deletedCount = await deleteDeclinedLeadsOlderThan(teamId, days)

    return NextResponse.json({
      success: true,
      message: `Deleted ${deletedCount} declined leads older than ${days} days`,
      deletedCount
    })
  } catch (error) {
    console.error("Error in auto-delete:", error)
    return NextResponse.json(
      { error: "Failed to auto-delete declined leads" },
      { status: 500 }
    )
  }
}
