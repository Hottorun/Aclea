"use client"

import useSWR from "swr"

export interface User {
  id: string
  email: string
  name: string
  role: "admin" | "user"
  teamId?: string
  teamRole?: "owner" | "admin" | "member"
}

const fetcher = (url: string) => fetch(url).then(res => res.json())

export function useUser() {
  const { data, isLoading } = useSWR("/api/auth", fetcher)

  return {
    user: (data?.user as User) ?? null,
    loading: isLoading,
  }
}
