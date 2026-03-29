import { NextResponse } from "next/server"
import { updateUserPassword, getUserProfile, getSupabase } from "@/lib/supabase"
import { sendPasswordChangedNotification } from "@/lib/email"
import { getCurrentUser } from "@/lib/auth"
import bcrypt from "bcryptjs"

// Same rules enforced across all password-setting flows
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser()
    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { currentPassword, newPassword } = body

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: "Current password and new password are required" }, { status: 400 })
    }

    if (newPassword.length < 8 || !PASSWORD_REGEX.test(newPassword)) {
      return NextResponse.json(
        { error: "New password must be at least 8 characters and contain uppercase, lowercase, a number, and a special character (!@#$%^&*)" },
        { status: 400 }
      )
    }

    const supabase = getSupabase()
    if (!supabase) {
      return NextResponse.json({ error: "Service unavailable" }, { status: 503 })
    }

    // Fetch stored hash and verify the caller actually knows the current password
    const { data: userData, error: fetchError } = await supabase
      .from("users")
      .select("password")
      .eq("id", user.id)
      .single()

    if (fetchError || !userData) {
      return NextResponse.json({ error: "Failed to verify current password" }, { status: 500 })
    }

    const isValid = await bcrypt.compare(currentPassword, userData.password)
    if (!isValid) {
      return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 })
    }

    const success = await updateUserPassword(user.id, newPassword)
    if (!success) {
      return NextResponse.json({ error: "Failed to update password" }, { status: 500 })
    }

    const profile = await getUserProfile(user.id)
    if (profile?.email) {
      await sendPasswordChangedNotification(profile.email, profile.name || "User")
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("Error changing password:", err)
    return NextResponse.json({ error: "Failed to change password" }, { status: 500 })
  }
}
