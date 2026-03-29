import { NextResponse } from "next/server"
import { sendContactFormEmail } from "@/lib/email"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, email, company, message } = body

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Name, email, and message are required" },
        { status: 400 }
      )
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      )
    }

    const result = await sendContactFormEmail({ name, email, company, message })

    if (!result.success) {
      console.error("Failed to send contact email:", result.error)
      return NextResponse.json(
        { error: "Failed to send message. Please try again." },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Contact form error:", error)
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    )
  }
}
