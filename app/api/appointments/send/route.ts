import { NextResponse } from "next/server"
import { getSettings } from "@/lib/supabase"
import { getCurrentUser } from "@/lib/auth"
import { sendEmail } from "@/lib/email"

interface AppointmentNotification {
  leadId: string
  leadName: string
  leadEmail: string
  leadPhone: string
  day: number   // 0=Mon … 6=Sun
  hour: number  // 0–23
  type: string
}

const DAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

function formatHour(h: number) {
  if (h === 0) return "12:00 AM"
  if (h === 12) return "12:00 PM"
  if (h < 12) return `${h}:00 AM`
  return `${h - 12}:00 PM`
}

function isAllowedWebhookUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    if (parsed.protocol !== "https:") return false
    const h = parsed.hostname
    if (
      h === "localhost" || h === "127.0.0.1" || h === "0.0.0.0" ||
      h === "169.254.169.254" || h.endsWith(".internal") ||
      /^10\./.test(h) || /^192\.168\./.test(h) || /^172\.(1[6-9]|2\d|3[01])\./.test(h)
    ) return false
    return true
  } catch { return false }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser()
    if (!user || !user.teamId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { appointments } = await request.json() as { appointments: AppointmentNotification[] }

    if (!Array.isArray(appointments) || appointments.length === 0) {
      return NextResponse.json({ error: "No appointments provided" }, { status: 400 })
    }

    const settings = await getSettings(user.teamId)
    const results: { leadId: string; channel: string; success: boolean; error?: string }[] = []

    for (const appt of appointments) {
      const dayName = DAY_NAMES[appt.day] ?? "the scheduled day"
      const timeStr = formatHour(appt.hour)
      const typeLabel =
        appt.type === "call" ? "Call" :
        appt.type === "follow-up" ? "Follow-up" : "Consultation"

      if (appt.leadEmail) {
        const result = await sendEmail({
          to: appt.leadEmail,
          subject: `Appointment Confirmed: ${typeLabel} on ${dayName} at ${timeStr}`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="text-align: center; margin-bottom: 24px;">
                <div style="display: inline-flex; align-items: center; gap: 8px;">
                  <div style="width: 40px; height: 40px; background: #059669; border-radius: 8px; display: flex; align-items: center; justify-content: center;">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                    </svg>
                  </div>
                  <span style="font-size: 24px; font-weight: 600; color: #1f2937;">Aclea</span>
                </div>
              </div>
              <h2 style="color: #1f2937; margin-bottom: 16px;">Appointment Confirmed</h2>
              <p style="color: #4b5563; line-height: 1.6;">Hi ${appt.leadName},</p>
              <p style="color: #4b5563; line-height: 1.6;">Your appointment has been scheduled:</p>
              <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin: 16px 0;">
                <p style="margin: 0 0 8px 0;"><strong style="color: #374151;">Type:</strong> <span style="color: #4b5563;">${typeLabel}</span></p>
                <p style="margin: 0 0 8px 0;"><strong style="color: #374151;">Day:</strong> <span style="color: #4b5563;">${dayName}</span></p>
                <p style="margin: 0;"><strong style="color: #374151;">Time:</strong> <span style="color: #4b5563;">${timeStr}</span></p>
              </div>
              <p style="color: #6b7280; font-size: 14px; line-height: 1.6;">We look forward to speaking with you. If you need to reschedule, please reply to this email.</p>
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">
              <p style="color: #9ca3af; font-size: 12px; text-align: center;">
                © ${new Date().getFullYear()} Aclea GmbH. All rights reserved.
              </p>
            </div>
          `,
        })
        results.push({ leadId: appt.leadId, channel: "email", success: result.success })
      } else if (appt.leadPhone && settings.webhookUrl) {
        if (!isAllowedWebhookUrl(settings.webhookUrl)) {
          results.push({ leadId: appt.leadId, channel: "webhook", success: false, error: "Invalid webhook URL" })
          continue
        }
        try {
          const res = await fetch(settings.webhookUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              event: "appointment_scheduled",
              leadId: appt.leadId,
              leadName: appt.leadName,
              phone: appt.leadPhone,
              type: appt.type,
              day: dayName,
              time: timeStr,
            }),
          })
          results.push({ leadId: appt.leadId, channel: "webhook", success: res.ok })
        } catch {
          results.push({ leadId: appt.leadId, channel: "webhook", success: false })
        }
      } else {
        results.push({ leadId: appt.leadId, channel: "none", success: false, error: "No contact method available" })
      }
    }

    return NextResponse.json({ success: true, results })
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }
}
