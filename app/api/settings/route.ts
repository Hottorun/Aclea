import { NextResponse } from "next/server"
import { getSettings, updateSettings } from "@/lib/supabase"

export async function GET() {
  const settings = await getSettings()
  return NextResponse.json(settings)
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const settings = await updateSettings(body)
    return NextResponse.json(settings)
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    )
  }
}
