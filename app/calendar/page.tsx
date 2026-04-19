"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import useSWR from "swr"
import { useRouter } from "next/navigation"
import { AppHeader } from "@/components/app-header"
import { CalendarView } from "@/components/calendar-view"
import { ThemeBackground } from "@/lib/use-theme-gradient"
import { useUser } from "@/lib/use-user"
import type { Lead } from "@/lib/types"
import { Save, X } from "lucide-react"

const fetcher = (url: string) => fetch(url).then(res => res.json())

export default function CalendarPage() {
  const router = useRouter()
  const { user, loading: userLoading } = useUser()
  const { data: leads = [], mutate, isValidating } = useSWR<Lead[]>("/api/leads", fetcher)

  const [hasUnsaved, setHasUnsaved] = useState(false)
  const [navDialog, setNavDialog]   = useState(false)
  const pendingProceedRef           = useRef<(() => void) | null>(null)
  const saveRef                     = useRef<() => Promise<void>>(async () => {})

  useEffect(() => {
    if (!userLoading && !user) {
      router.push("/login")
    }
  }, [user, userLoading, router])

  const navigationGuard = useCallback((path: string, proceed: () => void) => {
    if (!hasUnsaved) {
      proceed()
      return
    }
    pendingProceedRef.current = proceed
    setNavDialog(true)
  }, [hasUnsaved])

  const handleDialogSave = async () => {
    await saveRef.current()
    setNavDialog(false)
    pendingProceedRef.current?.()
    pendingProceedRef.current = null
  }

  const handleDialogDiscard = () => {
    setNavDialog(false)
    pendingProceedRef.current?.()
    pendingProceedRef.current = null
  }

  const handleDialogCancel = () => {
    setNavDialog(false)
    pendingProceedRef.current = null
  }

  if (userLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    )
  }

  return (
    <ThemeBackground>
      <AppHeader
        onRefresh={mutate}
        isRefreshing={isValidating}
        user={{ name: user.name, email: user.email }}
        leads={leads}
        navigationGuard={navigationGuard}
      />
      <CalendarView
        leads={leads}
        onUnsavedChange={setHasUnsaved}
        saveRef={saveRef}
      />

      {/* ── Unsaved changes dialog ── */}
      {navDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <h2 className="text-sm font-semibold">Unsaved appointments</h2>
              <button onClick={handleDialogCancel} className="p-1 rounded-md hover:bg-muted transition-colors">
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>
            <div className="px-4 py-4">
              <p className="text-sm text-muted-foreground">
                You have unsaved appointments. Would you like to save and notify customers before leaving?
              </p>
            </div>
            <div className="px-4 pb-4 flex gap-2">
              <button
                onClick={handleDialogDiscard}
                className="flex-1 py-2 rounded-md border border-border text-sm hover:bg-muted transition-colors"
              >
                Don&apos;t save
              </button>
              <button
                onClick={handleDialogSave}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-colors"
              >
                <Save className="h-3.5 w-3.5" />
                Save & continue
              </button>
            </div>
          </div>
        </div>
      )}
    </ThemeBackground>
  )
}