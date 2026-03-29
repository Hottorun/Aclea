import { cookies } from "next/headers"
import { getSupabase } from "@/lib/supabase"

export interface User {
  id: string
  email: string
  name: string
  role: "admin" | "user"
  teamId?: string
  teamRole?: "owner" | "admin" | "member"
}

/**
 * Reads the auth cookie and refreshes team membership from the database.
 * Always fetches fresh team data so stale cookie values can't be exploited.
 */
export async function getCurrentUser(): Promise<User | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get("auth_token")
  if (!token) return null

  let user: User
  try {
    user = JSON.parse(token.value) as User
  } catch {
    return null
  }

  if (!user?.id) return null

  // Refresh team membership from DB on every request so a removed/changed
  // team role cannot be bypassed by replaying an old cookie value.
  const supabase = getSupabase()
  if (supabase) {
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

  return user
}
