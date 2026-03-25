import { NextResponse } from "next/server"
import { getLeads, addLead, getSettings, updateLead } from "@/lib/supabase"
import type { IncomingLead, LeadStatus } from "@/lib/types"

export async function GET() {
  try {
    const leads = await getLeads()
    return NextResponse.json(leads)
  } catch (error) {
    console.error("API Error:", error)
    return NextResponse.json({ error: "Failed to fetch leads" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const { 
      name, phone, email, location, workType, conversationSummary, 
      approveMessage, declineMessage, rating, ratingReason, 
      contactPlatform, status, autoApproved, originalMessage 
    } = body

    if (!name || !phone || !email || !location || !workType || !conversationSummary || !approveMessage || !declineMessage || !rating || !ratingReason) {
      return NextResponse.json(
        { 
          error: "Missing required fields",
          required: ["name", "phone", "email", "location", "workType", "conversationSummary", "approveMessage", "declineMessage", "rating", "ratingReason"]
        },
        { status: 400 }
      )
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 5" },
        { status: 400 }
      )
    }

    const validStatuses: LeadStatus[] = ["pending", "approved", "declined", "unrelated"]
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Invalid status. Must be one of: pending, approved, declined, unrelated" },
        { status: 400 }
      )
    }

    let initialStatus: LeadStatus = status || "pending"
    let wasAutoApproved = false

    const settings = await getSettings()

    if (settings.autoApproveEnabled && rating >= settings.autoApproveMinRating) {
      initialStatus = "approved"
      wasAutoApproved = true
    }

    if (settings.autoDeclineUnrelated && status === "unrelated") {
      initialStatus = "unrelated"
    }

    const newLead = await addLead({
      name,
      phone,
      email,
      location,
      workType,
      conversationSummary,
      approveMessage,
      declineMessage,
      rating,
      ratingReason,
      contactPlatform: contactPlatform || "whatsapp",
      status: initialStatus,
      leadCount: 1,
      isLoyal: false,
      autoApproved: wasAutoApproved,
      originalMessage: originalMessage || "",
    })

    if (!newLead) {
      return NextResponse.json(
        { error: "Failed to create lead" },
        { status: 500 }
      )
    }

    return NextResponse.json(newLead, { status: 201, autoApproved: wasAutoApproved })
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    )
  }
}
