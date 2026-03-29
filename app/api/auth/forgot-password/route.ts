import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import crypto from "crypto"
import { sendPasswordResetEmail } from "@/lib/email"

// Always return this response regardless of whether the email exists,
// to prevent account enumeration attacks.
const ALWAYS_OK = { message: "If this email is registered, a reset link has been sent" }

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      )
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SECRET_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      // Don't expose config state — still return OK shape
      return NextResponse.json(ALWAYS_OK)
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    const { data: user } = await supabase
      .from("users")
      .select("id, email")
      .ilike("email", email)
      .limit(1)
      .single()

    if (user) {
      const resetToken = crypto.randomBytes(32).toString("hex")
      const resetExpires = new Date(Date.now() + 3600000)

      await supabase
        .from("users")
        .update({
          reset_token: resetToken,
          reset_expires: resetExpires.toISOString(),
        })
        .eq("id", user.id)

      sendPasswordResetEmail(email, resetToken).catch(console.error)
    }

    return NextResponse.json(ALWAYS_OK)
  } catch (err) {
    console.error("Forgot password error:", err)
    // Still return OK shape to avoid leaking whether the error was user-related
    return NextResponse.json(ALWAYS_OK)
  }
}
