import { NextResponse } from "next/server"
import { deleteAllLeads, deleteDeclinedLeadsOlderThan } from "@/lib/supabase"

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url)
  const action = searchParams.get("action")

  if (action === "all") {
    const success = await deleteAllLeads()
    if (!success) {
      return NextResponse.json(
        { error: "Failed to delete all leads" },
        { status: 500 }
      )
    }
    return NextResponse.json({ success: true })
  }

  if (action === "old-declined") {
    const days = parseInt(searchParams.get("days") || "30")
    const count = await deleteDeclinedLeadsOlderThan(days)
    return NextResponse.json({ success: true, deletedCount: count })
  }

  return NextResponse.json(
    { error: "Invalid action. Use 'all' or 'old-declined'" },
    { status: 400 }
  )
}
