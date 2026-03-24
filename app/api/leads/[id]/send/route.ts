import { NextResponse } from "next/server"
import { getLeadById, updateLead } from "@/lib/leads-store"
import type { SendMessageResponse, LeadStatus } from "@/lib/types"

// This endpoint sends a message back to your chatbot
// Configure CHATBOT_WEBHOOK_URL in your environment variables
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { action, message } = body as { action: "approve" | "decline"; message: string }

    if (!action || !message) {
      return NextResponse.json(
        { error: "Action and message are required" },
        { status: 400 }
      )
    }

    const lead = getLeadById(id)
    if (!lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 })
    }

    // Prepare the response to send to the chatbot
    const chatbotPayload: SendMessageResponse = {
      leadId: lead.id,
      action,
      message,
      phone: lead.phone,
    }

    // Send to your chatbot webhook (configure this URL)
    const webhookUrl = process.env.CHATBOT_WEBHOOK_URL
    
    if (webhookUrl) {
      try {
        await fetch(webhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(chatbotPayload),
        })
      } catch (webhookError) {
        console.error("Failed to send to chatbot webhook:", webhookError)
        // Continue anyway - we'll still update the lead status
      }
    }

    // Update lead status
    const newStatus: LeadStatus = action === "approve" ? "approved" : "declined"
    const updatedLead = updateLead(id, { 
      status: newStatus,
      // Also save the final message that was sent
      ...(action === "approve" ? { approveMessage: message } : { declineMessage: message })
    })

    return NextResponse.json({
      success: true,
      lead: updatedLead,
      sentPayload: chatbotPayload,
      webhookConfigured: !!webhookUrl,
    })
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    )
  }
}
