"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Shield, Eye, Check, AlertTriangle, Lock, Database, Trash2, Download, Loader2, X } from "lucide-react"
import { useUser } from "@/lib/use-user"
import { ThemeBackground } from "@/lib/use-theme-gradient"
import { cn } from "@/lib/utils"

interface Prefs {
  showPhonePublic: boolean
  showEmailPublic: boolean
  showLocationPublic: boolean
  autoDeleteOld: boolean
  dataRetentionDays: number
  analyticsEnabled: boolean
  errorTracking: boolean
}

const DEFAULT_PREFS: Prefs = {
  showPhonePublic: false,
  showEmailPublic: false,
  showLocationPublic: false,
  autoDeleteOld: true,
  dataRetentionDays: 90,
  analyticsEnabled: true,
  errorTracking: true,
}

function prefsFromApi(data: Record<string, unknown>): Prefs {
  return {
    showPhonePublic: (data.showPhonePublic as boolean) ?? false,
    showEmailPublic: (data.showEmailPublic as boolean) ?? false,
    showLocationPublic: (data.showLocationPublic as boolean) ?? false,
    autoDeleteOld: (data.autoDeleteOld as boolean) ?? true,
    dataRetentionDays: (data.dataRetentionDays as number) ?? 90,
    analyticsEnabled: (data.analyticsEnabled as boolean) ?? true,
    errorTracking: (data.errorTracking as boolean) ?? true,
  }
}

export default function PrivacyPage() {
  const router = useRouter()
  const { user } = useUser()
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null)
  const [preferences, setPreferences] = useState<Prefs>(DEFAULT_PREFS)
  const [isLoading, setIsLoading] = useState(true)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)
  const [teamMemberCount, setTeamMemberCount] = useState<number | null>(null)
  const [loadingMembers, setLoadingMembers] = useState(false)

  useEffect(() => {
    fetch("/api/settings/user")
      .then(res => res.json())
      .then(data => {
        if (data && !data.error) {
          setPreferences(prefsFromApi(data))
        }
      })
      .catch(console.error)
      .finally(() => setIsLoading(false))
  }, [])

  const showToast = (message: string, type: "success" | "error" | "info" = "info") => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const save = async (prefs: Prefs) => {
    try {
      const res = await fetch("/api/settings/user", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(prefs),
      })
      if (res.ok) {
        showToast("Preferences saved", "success")
      } else {
        showToast("Failed to save", "error")
      }
    } catch {
      showToast("Failed to save", "error")
    }
  }

  const handleToggle = (key: keyof Prefs) => {
    const newPrefs = { ...preferences, [key]: !preferences[key] }
    setPreferences(newPrefs)
    save(newPrefs)
  }

  const handleDataRetentionChange = (days: number) => {
    const newPrefs = { ...preferences, dataRetentionDays: days }
    setPreferences(newPrefs)
    save(newPrefs)
  }

  const openDeleteDialog = async () => {
    setDeleteConfirmText("")
    setShowDeleteDialog(true)
    if (user?.teamRole === "owner") {
      setLoadingMembers(true)
      try {
        const res = await fetch("/api/teams/members")
        const data = await res.json()
        // Don't count the owner themselves
        const others = (data.members ?? []).filter((m: { id: string }) => m.id !== user.id)
        setTeamMemberCount(others.length)
      } catch {
        setTeamMemberCount(0)
      } finally {
        setLoadingMembers(false)
      }
    }
  }

  const handleDeleteAccount = async () => {
    setIsDeleting(true)
    try {
      const isOwner = user?.teamRole === "owner"
      const res = await fetch("/api/settings/account", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(isOwner ? { deleteTeam: true } : {}),
      })
      const data = await res.json()
      if (res.ok) {
        document.cookie = "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
        router.push("/login")
      } else {
        showToast(data.error || "Failed to delete account", "error")
        setShowDeleteDialog(false)
      }
    } catch {
      showToast("Failed to delete account", "error")
      setShowDeleteDialog(false)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleRequestData = () => {
    showToast("Data export request submitted. You'll receive an email shortly.", "success")
  }

  const privacyOptions = [
    {
      category: "Profile Visibility",
      items: [
        { key: "showPhonePublic" as const, icon: Eye, title: "Show Phone Number", description: "Allow phone numbers to be visible in lead details" },
        { key: "showEmailPublic" as const, icon: Eye, title: "Show Email Address", description: "Allow email addresses to be visible in lead details" },
        { key: "showLocationPublic" as const, icon: Eye, title: "Show Location", description: "Allow location data to be visible in lead details" },
      ],
    },
    {
      category: "Data & Retention",
      items: [
        { key: "autoDeleteOld" as const, icon: Trash2, title: "Auto-Delete Old Data", description: "Automatically remove leads that haven't been updated" },
      ],
    },
    {
      category: "Analytics & Tracking",
      items: [
        { key: "analyticsEnabled" as const, icon: Database, title: "Usage Analytics", description: "Help improve aclea by sharing anonymous usage data" },
        { key: "errorTracking" as const, icon: AlertTriangle, title: "Error Reporting", description: "Automatically send error reports when issues occur" },
      ],
    },
  ]

  const dataRetentionOptions = [30, 60, 90, 180, 365]

  if (isLoading) {
    return (
      <ThemeBackground className="p-6">
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      </ThemeBackground>
    )
  }

  return (
    <ThemeBackground className="p-6">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => router.push("/settings")}
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground rounded-lg transition-colors cursor-pointer mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Settings
        </button>

        <div className="rounded-lg border border-border bg-card overflow-hidden">
          <div className="px-6 py-4 border-b border-border bg-muted">
            <h1 className="text-xl font-semibold text-foreground">Privacy Settings</h1>
            <p className="text-sm text-muted-foreground mt-1">Control your data and privacy preferences</p>
          </div>

          <div className="p-6 space-y-6">
            <div className="p-4 rounded-xl border border-border bg-muted">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 shrink-0">
                  <Shield className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Your data is secure</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    We take your privacy seriously. All data is encrypted and stored securely.
                  </p>
                </div>
              </div>
            </div>

            {privacyOptions.map((section) => (
              <div key={section.category}>
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3">
                  {section.category}
                </h3>
                <div className="space-y-3">
                  {section.items.map((item) => {
                    const Icon = item.icon
                    const isEnabled = preferences[item.key] as boolean
                    return (
                      <div key={item.key} className="p-4 rounded-xl border border-border bg-card hover:border-border/80 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                              <Icon className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <div>
                              <p className="font-medium text-foreground">{item.title}</p>
                              <p className="text-sm text-muted-foreground">{item.description}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleToggle(item.key)}
                            className={cn(
                              "relative w-12 h-6 rounded-full transition-colors cursor-pointer",
                              isEnabled ? "bg-foreground" : "bg-border"
                            )}
                          >
                            <span className={cn("absolute top-1 w-4 h-4 bg-card rounded-full transition-transform", isEnabled ? "left-7" : "left-1")} />
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}

            <div>
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3">
                Data Retention
              </h3>
              <div className="p-4 rounded-xl border border-border bg-card">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                    <Lock className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Retention Period</p>
                    <p className="text-sm text-muted-foreground">Automatically delete leads after this period of inactivity</p>
                  </div>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {dataRetentionOptions.map((days) => (
                    <button
                      key={days}
                      onClick={() => handleDataRetentionChange(days)}
                      className={cn(
                        "px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer border",
                        preferences.dataRetentionDays === days
                          ? "bg-foreground text-background border-foreground"
                          : "bg-background text-foreground border-border hover:bg-muted"
                      )}
                    >
                      {days} days
                    </button>
                  ))}
                </div>
                {preferences.dataRetentionDays === 365 && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Note: Very long retention periods may affect performance.
                  </p>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-border">
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3">
                Your Rights
              </h3>
              <div className="p-4 rounded-xl border border-border bg-card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">Request Your Data</p>
                    <p className="text-sm text-muted-foreground">Download all your data in a portable format</p>
                  </div>
                  <button
                    onClick={handleRequestData}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-foreground text-background rounded-lg hover:bg-foreground/90 transition-colors cursor-pointer"
                  >
                    <Download className="h-4 w-4" />
                    Request
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-destructive/30">
              <h3 className="text-sm font-medium text-destructive uppercase tracking-wide mb-3">
                Danger Zone
              </h3>
              <div className="p-4 rounded-xl border border-destructive/30 bg-destructive/5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">Delete Account</p>
                    <p className="text-sm text-muted-foreground">Permanently delete your account and all associated data</p>
                  </div>
                  <button
                    onClick={openDeleteDialog}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 transition-colors cursor-pointer"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showDeleteDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <div className="flex items-center gap-2">
                <Trash2 className="h-4 w-4 text-destructive" />
                <h2 className="text-sm font-semibold">Delete Account</h2>
              </div>
              <button onClick={() => setShowDeleteDialog(false)} className="p-1 rounded-md hover:bg-muted transition-colors">
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>

            {/* Owner with other members — blocked */}
            {user?.teamRole === "owner" && (loadingMembers || (teamMemberCount !== null && teamMemberCount > 0)) ? (
              <div className="px-5 py-4 space-y-4">
                {loadingMembers ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <>
                    <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-foreground">You must transfer ownership first</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Your team has {teamMemberCount} other member{teamMemberCount !== 1 ? "s" : ""}. Go to Team Settings and appoint a new owner before deleting your account.
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => { setShowDeleteDialog(false); router.push("/settings/team") }}
                      className="w-full py-2 rounded-md bg-foreground text-background text-sm font-medium hover:bg-foreground/90 transition-colors"
                    >
                      Go to Team Settings
                    </button>
                  </>
                )}
              </div>
            ) : (
              /* Everyone else, or owner with no other members */
              <div className="px-5 py-4 space-y-4">
                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                  <p className="text-sm text-destructive font-medium">This cannot be undone.</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {user?.teamRole === "owner"
                      ? "Your account and team will be permanently deleted (you're the only member)."
                      : "Your account and all associated data will be permanently deleted."}
                  </p>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">
                    Type <span className="font-mono font-semibold text-foreground">DELETE</span> to confirm
                  </label>
                  <input
                    type="text"
                    value={deleteConfirmText}
                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                    placeholder="DELETE"
                    className="w-full h-9 px-3 rounded-md border border-border bg-background text-sm focus:outline-none focus:ring-1 focus:ring-destructive/40"
                    autoFocus
                  />
                </div>
              </div>
            )}

            {/* Footer — only show confirm button when not blocked */}
            {!(user?.teamRole === "owner" && (loadingMembers || (teamMemberCount !== null && teamMemberCount > 0))) && (
              <div className="px-5 pb-5 flex gap-2">
                <button
                  onClick={() => setShowDeleteDialog(false)}
                  className="flex-1 py-2 rounded-md border border-border text-sm hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleteConfirmText !== "DELETE" || isDeleting}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md bg-destructive text-destructive-foreground text-sm font-medium hover:bg-destructive/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isDeleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                  {isDeleting ? "Deleting..." : "Delete"}
                </button>
              </div>
            )}

            {/* Footer for blocked state — just cancel */}
            {user?.teamRole === "owner" && !loadingMembers && teamMemberCount !== null && teamMemberCount > 0 && (
              <div className="px-5 pb-5">
                <button
                  onClick={() => setShowDeleteDialog(false)}
                  className="w-full py-2 rounded-md border border-border text-sm hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {toast && (
        <div className={cn(
          "fixed bottom-6 right-6 flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border transition-all",
          toast.type === "success" && "bg-card border-border",
          toast.type === "error" && "bg-destructive/10 border-destructive/30",
          toast.type === "info" && "bg-card border-border"
        )}>
          {toast.type === "success" && <Check className="h-5 w-5 text-emerald-600" />}
          {toast.type === "error" && <AlertTriangle className="h-5 w-5 text-destructive" />}
          {toast.type === "info" && <Shield className="h-5 w-5 text-foreground" />}
          <span className="text-sm font-medium text-foreground">{toast.message}</span>
        </div>
      )}
    </ThemeBackground>
  )
}
