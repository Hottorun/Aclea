import { NextResponse } from "next/server"
import { getLeads, addLead } from "@/lib/leads-store"
import type { LeadStatus, LeadTag } from "@/lib/types"

export async function GET() {
  const leads = getLeads()
  return NextResponse.json(leads)
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const { name, phone, message, source, tags } = body

    if (!name || !phone || !message) {
      return NextResponse.json(
        { error: "Name, phone, and message are required" },
        { status: 400 }
      )
    }

    const newLead = addLead({
      name,
      phone,
      message,
      source: source || "WhatsApp API",
      status: "new" as LeadStatus,
      tags: (tags || []) as LeadTag[],
      assignedTo: null,
      notes: [],
    })

    return NextResponse.json(newLead, { status: 201 })
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    )
  }
}
