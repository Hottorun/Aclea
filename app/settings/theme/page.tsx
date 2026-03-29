"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Check, Moon, Sun, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useUser } from "@/lib/use-user"
import { useTheme } from "next-themes"
import { ThemeBackground } from "@/lib/use-theme-gradient"
import type { UserSettings } from "@/lib/types"

export default function ThemePage() {
  const router = useRouter()
  const { user, loading: userLoading } = useUser()
  const { setTheme, theme } = useTheme()
  const [selectedMode, setSelectedMode] = useState<"light" | "dark">("light")
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (!userLoading && !user) {
      router.push("/login")
    }
  }, [user, userLoading, router])

  useEffect(() => {
    if (!user?.id) return

    fetch("/api/settings/user")
      .then(res => res.json())
      .then((data: UserSettings) => {
        if (data && typeof data === 'object' && 'theme' in data) {
          const mode = (data.theme as "light" | "dark") || "light"
          setSelectedMode(mode)
          setTheme(mode)
        }
      })
      .catch(console.error)
      .finally(() => setIsLoading(false))
  }, [user?.id, setTheme])

  const handleModeChange = (mode: "light" | "dark") => {
    setSelectedMode(mode)
    setTheme(mode)
  }

  const handleSave = async () => {
    if (!user?.id) return
    setIsSaving(true)
    try {
      const res = await fetch("/api/settings/user", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ theme: selectedMode })
      })
      if (res.ok) {
        setSaved(true)
        setTimeout(() => {
          setSaved(false)
          router.push("/settings")
        }, 1200)
      }
    } catch {
      console.error("Failed to save theme")
    } finally {
      setIsSaving(false)
    }
  }

  if (userLoading || isLoading) {
    return (
      <ThemeBackground>
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      </ThemeBackground>
    )
  }

  if (!user) return null

  return (
    <ThemeBackground className="p-6">
      <div className="max-w-lg mx-auto space-y-6">
        <button
          onClick={() => router.push("/settings")}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Settings
        </button>

        <div>
          <h1 className="text-xl font-semibold tracking-tight">Appearance</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Choose your display mode</p>
        </div>

        <div className="rounded-lg border border-border bg-card overflow-hidden">
          <div className="px-4 py-3 border-b border-border">
            <h2 className="text-sm font-medium">Display Mode</h2>
          </div>
          <div className="p-4 grid grid-cols-2 gap-3">
            {/* Light Mode */}
            <button
              onClick={() => handleModeChange("light")}
              className={cn(
                "relative rounded-lg border-2 p-4 text-left transition-all",
                mounted && selectedMode === "light"
                  ? "border-foreground"
                  : "border-border hover:border-foreground/30"
              )}
            >
              <div className="h-14 w-full rounded-md bg-[#F6F8FA] border border-border/40 flex items-center justify-center mb-3">
                <div className="flex gap-1.5 items-center">
                  <div className="h-5 w-5 rounded bg-white border border-border/60" />
                  <div className="space-y-1">
                    <div className="h-1.5 w-10 rounded-full bg-gray-300" />
                    <div className="h-1.5 w-7 rounded-full bg-gray-200" />
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Sun className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-sm font-medium">Light</span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">Clean and bright</p>
              {mounted && selectedMode === "light" && (
                <div className="absolute top-2.5 right-2.5 h-5 w-5 rounded-full bg-foreground flex items-center justify-center">
                  <Check className="h-3 w-3 text-background" />
                </div>
              )}
            </button>

            {/* Dark Mode */}
            <button
              onClick={() => handleModeChange("dark")}
              className={cn(
                "relative rounded-lg border-2 p-4 text-left transition-all",
                mounted && selectedMode === "dark"
                  ? "border-foreground"
                  : "border-border hover:border-foreground/30"
              )}
            >
              <div className="h-14 w-full rounded-md bg-[#0f172a] border border-white/10 flex items-center justify-center mb-3">
                <div className="flex gap-1.5 items-center">
                  <div className="h-5 w-5 rounded bg-[#1e293b] border border-white/10" />
                  <div className="space-y-1">
                    <div className="h-1.5 w-10 rounded-full bg-slate-600" />
                    <div className="h-1.5 w-7 rounded-full bg-slate-700" />
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Moon className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-sm font-medium">Dark</span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">Easy on the eyes</p>
              {mounted && selectedMode === "dark" && (
                <div className="absolute top-2.5 right-2.5 h-5 w-5 rounded-full bg-foreground flex items-center justify-center">
                  <Check className="h-3 w-3 text-background" />
                </div>
              )}
            </button>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <button
            onClick={() => router.push("/settings")}
            className="px-4 py-2 text-sm border border-border rounded-md hover:bg-muted transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className={cn(
              "px-4 py-2 text-sm rounded-md transition-all flex items-center gap-2",
              saved
                ? "bg-[var(--status-approved)] text-white"
                : "bg-foreground text-background hover:bg-foreground/90",
              isSaving && "opacity-50"
            )}
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : saved ? (
              <>
                <Check className="h-4 w-4" />
                Saved!
              </>
            ) : (
              "Save"
            )}
          </button>
        </div>
      </div>
    </ThemeBackground>
  )
}
