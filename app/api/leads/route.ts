import { NextResponse } from "next/server"
import { getLeads, addLead } from "@/lib/supabase"
import { getCurrentUser } from "@/lib/auth"
import type { CollectedData, Lead } from "@/lib/types"

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const leads = await getLeads(user.teamId)

    const filteredLeads = (leads || []).filter((l: Lead) => {
      const status = l.session?.status
      return status !== "cancelled"
    })

    return NextResponse.json(filteredLeads)
  } catch (error) {
    console.error("API Error:", error)
    return NextResponse.json([])
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser()
    if (!user || !user.teamId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()

    const {
      name, phone, email, location, workType, message, company, budget, timeline,
      contactPlatform
    } = body

    if (!name || !phone || !email) {
      return NextResponse.json(
        {
          error: "Missing required fields",
          required: ["name", "phone", "email"]
        },
        { status: 400 }
      )
    }

    const collectedData: CollectedData = {
      name,
      phone,
      email,
      ...(location && { location }),
      ...(workType && { workType }),
      ...(message && { message }),
      ...(company && { company }),
      ...(budget && { budget }),
      ...(timeline && { timeline }),
      ...(contactPlatform && { contactPlatform }),
    }

    const newLead = await addLead({
      name,
      phone,
      email,
      collectedData,
      teamId: user.teamId,
    })

    if (!newLead) {
      return NextResponse.json(
        { error: "Failed to create lead" },
        { status: 500 }
      )
    }

    return NextResponse.json(newLead)
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    )
  }
}
