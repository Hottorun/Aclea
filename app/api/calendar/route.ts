import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { getSupabase } from "@/lib/supabase"

export async function GET(request: Request) {
  const user = await getCurrentUser()
  if (!user?.teamId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const memberId = searchParams.get("memberId") || "me"

  const supabase = getSupabase()
  if (!supabase) {
    return NextResponse.json({ appointments: [], workingHours: {} })
  }

  const { data, error } = await supabase
    .from("calendar_schedules")
    .select("appointments, working_hours")
    .eq("team_id", user.teamId)
    .eq("member_id", memberId)
    .single()

  if (error || !data) {
    return NextResponse.json({ appointments: [], workingHours: {} })
  }

  return NextResponse.json({
    appointments: data.appointments ?? [],
    workingHours: data.working_hours ?? {},
  })
}

export async function PUT(request: Request) {
  const user = await getCurrentUser()
  if (!user?.teamId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { memberId, appointments, workingHours } = await request.json()

  const supabase = getSupabase()
  if (!supabase) {
    return NextResponse.json({ success: true })
  }

  const { error } = await supabase
    .from("calendar_schedules")
    .upsert(
      {
        team_id: user.teamId,
        member_id: memberId || "me",
        appointments,
        working_hours: workingHours,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "team_id,member_id" }
    )

  if (error) {
    console.error("Error saving calendar schedule:", error)
    return NextResponse.json({ error: "Failed to save" }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
