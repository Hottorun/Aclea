import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createClient } from "@supabase/supabase-js"
import bcrypt from "bcryptjs"
import { sendWelcomeEmail } from "@/lib/email"
import type { User } from "@/lib/auth"

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, email, password, inviteCode } = body

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required" },
        { status: 400 }
      )
    }

    if (password.length < 8 || !PASSWORD_REGEX.test(password)) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters and contain uppercase, lowercase, a number, and a special character (!@#$%^&*)" },
        { status: 400 }
      )
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SECRET_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { error: "Authentication not configured. Please contact the administrator." },
        { status: 500 }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    const { data: existingUser } = await supabase
      .from("users")
      .select("id")
      .ilike("email", email)
      .limit(1)

    if (existingUser && existingUser.length > 0) {
      return NextResponse.json(
        { error: "This email address is already registered" },
        { status: 400 }
      )
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    let teamId: string | undefined
    let teamRole: "owner" | "admin" | "member" = "member"

    if (inviteCode) {
      const { data: teamData } = await supabase
        .from("teams")
        .select("id, invite_code")
        .eq("invite_code", inviteCode)
        .single()

      if (teamData) {
        teamId = teamData.id
        teamRole = "member"
      } else {
        return NextResponse.json(
          { error: "Invalid invite code" },
          { status: 400 }
        )
      }
    }

    const { data: newUser, error: createError } = await supabase
      .from("users")
      .insert({
        email,
        name,
        password: hashedPassword,
        role: "user",
        team_id: teamId,
        team_role: teamId ? teamRole : null,
      })
      .select()
      .single()

    if (createError || !newUser) {
      console.error("Error creating user:", createError)
      return NextResponse.json(
        { error: "Failed to create account" },
        { status: 500 }
      )
    }

    sendWelcomeEmail(email, name).catch(console.error)

    const user: User = {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
      teamId: newUser.team_id,
      teamRole: newUser.team_role,
    }

    const cookieStore = await cookies()
    cookieStore.set("auth_token", JSON.stringify(user), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    })

    if (!teamId) {
      return NextResponse.json({ user, needsTeam: true })
    }

    return NextResponse.json({ user })
  } catch (err) {
    console.error("Registration error:", err)
    return NextResponse.json(
      { error: "Registration failed" },
      { status: 500 }
    )
  }
}
