import { NextResponse } from "next/server"
import { getSupabase } from "@/lib/supabase"
import { getCurrentUser } from "@/lib/auth"
import bcrypt from "bcryptjs"

async function getUsers() {
  const supabase = getSupabase()
  if (!supabase) return []

  const { data, error } = await supabase
    .from("users")
    .select("id, email, name, role")
    .order("created_at", { ascending: true })

  if (error) {
    console.error("Error fetching users:", error)
    return []
  }

  return data
}

export async function GET() {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const users = await getUsers()
    return NextResponse.json(users)
  } catch {
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser || currentUser.role !== "admin") {
      return NextResponse.json({ error: "Only admins can create users" }, { status: 403 })
    }

    const body = await request.json()
    const { email, password, name, role } = body

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "Email, password, and name are required" },
        { status: 400 }
      )
    }

    if (!["admin", "user"].includes(role)) {
      return NextResponse.json(
        { error: "Role must be 'admin' or 'user'" },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      )
    }

    const supabase = getSupabase()
    if (!supabase) {
      return NextResponse.json({ error: "Service unavailable" }, { status: 503 })
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    const { data, error } = await supabase
      .from("users")
      .insert({ email, password: hashedPassword, name, role })
      .select("id, email, name, role")
      .single()

    if (error) {
      console.error("Error creating user:", error)
      return NextResponse.json({ error: "Failed to create user" }, { status: 500 })
    }

    return NextResponse.json(data, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser || currentUser.role !== "admin") {
      return NextResponse.json({ error: "Only admins can update users" }, { status: 403 })
    }

    const body = await request.json()
    const { id, email, name, role, password } = body

    if (!id) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    if (password && password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      )
    }

    const supabase = getSupabase()
    if (!supabase) {
      return NextResponse.json({ error: "Service unavailable" }, { status: 503 })
    }

    const updates: Record<string, string> = {}
    if (email) updates.email = email
    if (name) updates.name = name
    if (role) updates.role = role
    if (password) updates.password = await bcrypt.hash(password, 12)

    const { data, error } = await supabase
      .from("users")
      .update(updates)
      .eq("id", id)
      .select("id, email, name, role")
      .single()

    if (error) {
      console.error("Error updating user:", error)
      return NextResponse.json({ error: "Failed to update user" }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser || currentUser.role !== "admin") {
      return NextResponse.json({ error: "Only admins can delete users" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    if (id === currentUser.id) {
      return NextResponse.json({ error: "Cannot delete yourself" }, { status: 400 })
    }

    const supabase = getSupabase()
    if (!supabase) {
      return NextResponse.json({ error: "Service unavailable" }, { status: 503 })
    }

    const { error } = await supabase
      .from("users")
      .delete()
      .eq("id", id)

    if (error) {
      console.error("Error deleting user:", error)
      return NextResponse.json({ error: "Failed to delete user" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 })
  }
}
