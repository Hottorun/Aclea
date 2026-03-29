import { NextResponse } from "next/server"
import { getLeadById, updateLeadSession, updateLead, getSettings } from "@/lib/supabase"
import { getCurrentUser } from "@/lib/auth"
import type { SendMessageResponse } from "@/lib/types"

/**
 * Validates that a webhook URL is an external HTTPS endpoint.
 * Blocks localhost and RFC-1918 private ranges to prevent SSRF.
 */
function isAllowedWebhookUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    if (parsed.protocol !== "https:") return false
    const h = parsed.hostname
    if (
      h === "localhost" ||
      h === "127.0.0.1" ||
      h === "0.0.0.0" ||
      h === "169.254.169.254" ||
      h.endsWith(".internal") ||
      /^10\./.test(h) ||
      /^192\.168\./.test(h) ||
      /^172\.(1[6-9]|2\d|3[01])\./.test(h)
    ) {
      return false
    }
    return true
  } catch {
    return false
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user || !user.teamId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { action, message } = body as { action: "approve" | "decline" | "unrelated"; message: string }

    if (!action || !message) {
      return NextResponse.json(
        { error: "Action and message are required" },
        { status: 400 }
      )
    }

    const lead = await getLeadById(id)
    if (!lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 })
    }

    // teamId comes from the verified session — never trust the request body for ownership
    if (lead.teamId !== user.teamId) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 })
    }

    const session = lead.session
    if (!session || !session.id) {
      return NextResponse.json({ error: "Lead session not found" }, { status: 404 })
    }

    const settings = await getSettings(user.teamId)
    const webhookUrl = settings.webhookUrl

    const chatbotPayload: SendMessageResponse = {
      leadId: lead.id,
      action,
      message,
      phone: lead.phone,
    }

    let webhookSent = false
    if (webhookUrl) {
      if (!isAllowedWebhookUrl(webhookUrl)) {
        console.error("Blocked webhook request to disallowed URL")
      } else {
        try {
          const webhookResponse = await fetch(webhookUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(chatbotPayload),
          })
          webhookSent = webhookResponse.ok
          if (!webhookResponse.ok) {
            console.error("Webhook failed:", webhookResponse.status)
          }
        } catch (webhookError) {
          console.error("Failed to send to webhook:", webhookError)
        }
      }
    }

    const ratingReason =
      action === "approve"
        ? "Approved by user"
        : action === "decline"
        ? "Declined by user"
        : "Marked as unrelated"

    const updatedSession = await updateLeadSession(session.id, {
      status: "completed",
      rating: action === "approve",
      ratingReason,
    })

    await updateLead(id, {
      lastContactedAt: new Date().toISOString(),
    })

    return NextResponse.json({ success: true, session: updatedSession, webhookSent })
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    )
  }
}
