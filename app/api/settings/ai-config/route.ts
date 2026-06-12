import { NextResponse } from "next/server"
import { getTeamConfig, updateTeamConfig } from "@/lib/supabase"
import { getCurrentUser } from "@/lib/auth"

export async function GET() {
  const user = await getCurrentUser()
  if (!user?.teamId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const config = await getTeamConfig(user.teamId)
  return NextResponse.json(config ?? {
    teamsId: user.teamId,
    requiredFields: [],
    qualificationRules: {},
    toneOfVoice: "professional",
    aiSystemPrompt: "",
    flowType: "qualification",
  })
}

export async function PATCH(request: Request) {
  const user = await getCurrentUser()
  if (!user?.teamId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  try {
    const body = await request.json()
    const config = await updateTeamConfig(user.teamId, body)
    if (!config) {
      return NextResponse.json({ error: "Failed to update config" }, { status: 500 })
    }
    return NextResponse.json(config)
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }
}
