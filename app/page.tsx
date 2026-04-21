"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { LandingPage } from "@/components/landing-page"

export default function Home() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    document.documentElement.classList.remove("dark")
    document.documentElement.removeAttribute("data-mode")
    document.documentElement.style.background = "#F5F5F4"
    document.documentElement.style.colorScheme = "light"
  }, [])

  useEffect(() => {
    fetch("/api/auth")
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          router.push("/dashboard")
        }
      })
      .catch(() => {
        // Stay on landing page if auth check fails
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    )
  }

  return <LandingPage />
}