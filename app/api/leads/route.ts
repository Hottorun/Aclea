import { NextResponse } from "next/server"
import { getLeads, addLead } from "@/lib/leads-store"
import type { IncomingLead } from "@/lib/types"

export async function GET() {
  const leads = getLeads()
  return NextResponse.json(leads)
}

export async function POST(request: Request) {
  try {
    const body: IncomingLead = await request.json()

    const { name, phone, email, location, workType, conversationSummary, approveMessage, declineMessage } = body

    // Validate required fields
    if (!name || !phone || !email || !location || !workType || !conversationSummary || !approveMessage || !declineMessage) {
      return NextResponse.json(
        { 
          error: "Missing required fields",
          required: ["name", "phone", "email", "location", "workType", "conversationSummary", "approveMessage", "declineMessage"]
        },
        { status: 400 }
      )
    }

    const newLead = addLead({
      name,
      phone,
      email,
      location,
      workType,
      conversationSummary,
      approveMessage,
      declineMessage,
    })

    return NextResponse.json(newLead, { status: 201 })
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    )
  }
}
