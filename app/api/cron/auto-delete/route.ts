import { NextResponse } from "next/server"
import { deleteDeclinedLeadsOlderThan, getSettings } from "@/lib/supabase"

export async function POST() {
  try {
    const settings = await getSettings()
    const days = settings.autoDeleteDeclinedDays
    
    if (days <= 0) {
      return NextResponse.json({
        success: true,
        message: "Auto-delete is disabled",
        deletedCount: 0
      })
    }
    
    const deletedCount = await deleteDeclinedLeadsOlderThan(days)
    
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
