import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { getSupabase } from "@/lib/supabase"
import bcrypt from "bcryptjs"
import type { User } from "@/lib/auth"

interface DbUser extends User {
  password: string
  team_id?: string
  team_role?: string
}

async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

async function getUserByEmail(email: string): Promise<DbUser | null> {
  const supabase = getSupabase()
  if (!supabase) return null

  const { data, error } = await supabase.rpc('get_user_by_email', { p_email: email })
  
  if (error || !data || data.length === 0) return null
  return data[0]
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      )
    }

    const supabase = getSupabase()
    
    if (!supabase) {
      return NextResponse.json(
        { error: "Authentication not configured. Please contact administrator." },
        { status: 500 }
      )
    }

    const userData = await getUserByEmail(email)
    
    if (!userData) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      )
    }
    
    const passwordValid = await verifyPassword(password, userData.password)
    
    if (!passwordValid) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      )
    }
    
    const user: User = {
      id: userData.id,
      email: userData.email,
      name: userData.name,
      role: userData.role,
      teamId: userData.team_id,
      teamRole: userData.team_role as "owner" | "admin" | "member" | undefined,
    }

    const cookieStore = await cookies()
    cookieStore.set("auth_token", JSON.stringify(user), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    })

    return NextResponse.json({ user })
  } catch (err) {
    console.error("Login error:", err)
    return NextResponse.json(
      { error: "Login failed" },
      { status: 500 }
    )
  }
}

export async function DELETE() {
  const cookieStore = await cookies()
  cookieStore.delete("auth_token")
  return NextResponse.json({ success: true })
}

export async function GET() {
  const cookieStore = await cookies()
  const token = cookieStore.get("auth_token")

  if (!token) {
    return NextResponse.json({ user: null })
  }

  try {
    let user: User
    try {
      user = JSON.parse(token.value) as User
    } catch {
      return NextResponse.json(
        { error: "Invalid authentication token format" },
        { status: 401 }
      )
    }
    
    // Refresh team info from database
    const supabase = getSupabase()
    if (supabase && user.id) {
      const { data } = await supabase
        .from("users")
        .select("team_id, team_role")
        .eq("id", user.id)
        .single()
      
      if (data) {
        user.teamId = data.team_id
        user.teamRole = data.team_role
      }
    }
    
    return NextResponse.json({ user })
  } catch {
    return NextResponse.json({ user: null })
  }
}
