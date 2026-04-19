"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Bell, Check, AlertTriangle, Mail, MessageCircle, Clock, CheckCircle, XCircle, Phone, Smartphone, Loader2 } from "lucide-react"
import { ThemeBackground } from "@/lib/use-theme-gradient"
import { cn } from "@/lib/utils"

interface Prefs {
  pushEnabled: boolean
  emailEnabled: boolean
  phoneEnabled: boolean
  newLeads: boolean
  leadApproved: boolean
  leadDeclined: boolean
  manualReview: boolean
  dailySummary: boolean
  weeklyReport: boolean
}

const DEFAULT_PREFS: Prefs = {
  pushEnabled: true,
  emailEnabled: true,
  phoneEnabled: false,
  newLeads: true,
  leadApproved: true,
  leadDeclined: true,
  manualReview: true,
  dailySummary: false,
  weeklyReport: true,
}

function prefsFromApi(data: Record<string, unknown>): Prefs {
  return {
    pushEnabled: (data.notificationsEnabled as boolean) ?? true,
    emailEnabled: true,   // UI-only, not persisted
    phoneEnabled: false,  // UI-only, not persisted
    newLeads: (data.notifyNewLeads as boolean) ?? true,
    leadApproved: (data.notifyLeadApproved as boolean) ?? true,
    leadDeclined: (data.notifyLeadDeclined as boolean) ?? true,
    manualReview: (data.notifyManualReview as boolean) ?? true,
    dailySummary: (data.notifyDailySummary as boolean) ?? false,
    weeklyReport: (data.notifyWeeklyReport as boolean) ?? true,
  }
}

function prefsToApi(prefs: Prefs) {
  return {
    notificationsEnabled: prefs.pushEnabled,
    notifyNewLeads: prefs.newLeads,
    notifyLeadApproved: prefs.leadApproved,
    notifyLeadDeclined: prefs.leadDeclined,
    notifyManualReview: prefs.manualReview,
    notifyDailySummary: prefs.dailySummary,
    notifyWeeklyReport: prefs.weeklyReport,
  }
}

export default function NotificationsPage() {
  const router = useRouter()
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null)
  const [preferences, setPreferences] = useState<Prefs>(DEFAULT_PREFS)
  const [isLoading, setIsLoading] = useState(true)

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
        body: JSON.stringify(prefsToApi(prefs)),
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
    // Only persist keys that map to the DB
    if (!["emailEnabled", "phoneEnabled"].includes(key)) {
      save(newPrefs)
    }
  }


  const notificationTypes = [
    {
      category: "Lead Notifications",
      items: [
        { key: "newLeads" as const, icon: MessageCircle, title: "New Leads", description: "Get notified when new leads come in", color: "text-emerald-500", bgColor: "bg-emerald-100" },
        { key: "leadApproved" as const, icon: CheckCircle, title: "Leads Approved", description: "Notifications when leads are approved", color: "text-blue-500", bgColor: "bg-blue-100" },
        { key: "leadDeclined" as const, icon: XCircle, title: "Leads Declined", description: "Notifications when leads are declined", color: "text-muted-foreground", bgColor: "bg-muted" },
        { key: "manualReview" as const, icon: Clock, title: "Manual Review Needed", description: "Reminders for leads requiring manual review", color: "text-amber-500", bgColor: "bg-amber-100" },
      ],
    },
    {
      category: "Reports",
      items: [
        { key: "dailySummary" as const, icon: Bell, title: "Daily Summary", description: "Receive a daily summary of lead activity", color: "text-purple-500", bgColor: "bg-purple-100" },
        { key: "weeklyReport" as const, icon: Mail, title: "Weekly Report", description: "Get weekly performance reports via email", color: "text-indigo-500", bgColor: "bg-indigo-100" },
      ],
    },
  ]

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
            <h1 className="text-xl font-semibold text-foreground">Notification Preferences</h1>
            <p className="text-sm text-muted-foreground mt-1">Choose how you want to be notified</p>
          </div>

          <div className="p-6 space-y-6">
            <div className="p-4 rounded-xl border border-border bg-muted">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                    <Bell className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Push Notifications</p>
                    <p className="text-sm text-muted-foreground">Enable or disable all notifications</p>
                  </div>
                </div>
                <button
                  onClick={() => handleToggle("pushEnabled")}
                  className={cn(
                    "relative w-12 h-6 rounded-full transition-colors cursor-pointer",
                    preferences.pushEnabled ? "bg-foreground" : "bg-border"
                  )}
                >
                  <span className={cn("absolute top-1 w-4 h-4 bg-card rounded-full transition-transform", preferences.pushEnabled ? "left-7" : "left-1")} />
                </button>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-border bg-muted">
              <h3 className="text-sm font-medium text-foreground mb-4">Notification Channels</h3>
              <div className="space-y-3">
                {[
                  { key: "pushEnabled" as const, Icon: Smartphone, label: "Push Notifications", sub: "Browser/app notifications", color: "bg-indigo-100", iconColor: "text-indigo-600" },
                  { key: "emailEnabled" as const, Icon: Mail, label: "Email Notifications", sub: "Receive updates via email", color: "bg-emerald-100", iconColor: "text-emerald-600" },
                  { key: "phoneEnabled" as const, Icon: Phone, label: "SMS/Phone Notifications", sub: "Receive updates via text message", color: "bg-amber-100", iconColor: "text-amber-600" },
                ].map(({ key, Icon, label, sub, color, iconColor }) => (
                  <div key={key} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg", color)}>
                        <Icon className={cn("h-5 w-5", iconColor)} />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{label}</p>
                        <p className="text-sm text-muted-foreground">{sub}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleToggle(key)}
                      className={cn(
                        "relative w-12 h-6 rounded-full transition-colors cursor-pointer",
                        preferences[key] ? "bg-foreground" : "bg-border"
                      )}
                    >
                      <span className={cn("absolute top-1 w-4 h-4 bg-card rounded-full transition-transform", preferences[key] ? "left-7" : "left-1")} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {notificationTypes.map((section) => (
              <div key={section.category}>
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3">
                  {section.category}
                </h3>
                <div className="space-y-3">
                  {section.items.map((item) => {
                    const Icon = item.icon
                    const isEnabled = preferences[item.key]
                    const isChannelEnabled = preferences.pushEnabled || preferences.emailEnabled || preferences.phoneEnabled
                    return (
                      <div
                        key={item.key}
                        className={cn(
                          "p-4 rounded-xl border transition-colors",
                          isChannelEnabled ? "border-border bg-card" : "border-border bg-muted opacity-60"
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg", item.bgColor)}>
                              <Icon className={cn("h-5 w-5", item.color)} />
                            </div>
                            <div>
                              <p className="font-medium text-foreground">{item.title}</p>
                              <p className="text-sm text-muted-foreground">{item.description}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleToggle(item.key)}
                            disabled={!isChannelEnabled}
                            className={cn(
                              "relative w-12 h-6 rounded-full transition-colors cursor-pointer",
                              isEnabled && isChannelEnabled ? "bg-foreground" : "bg-border",
                              !isChannelEnabled && "cursor-not-allowed"
                            )}
                          >
                            <span className={cn("absolute top-1 w-4 h-4 bg-card rounded-full transition-transform", isEnabled && isChannelEnabled ? "left-7" : "left-1")} />
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}

            <div className="pt-4 border-t border-border">
              <p className="text-xs text-center text-muted-foreground">Changes save automatically</p>
            </div>
          </div>
        </div>
      </div>

      {toast && (
        <div className={cn(
          "fixed bottom-6 right-6 flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border transition-all",
          toast.type === "success" && "bg-card border-border",
          toast.type === "error" && "bg-destructive/10 border-destructive/30",
          toast.type === "info" && "bg-card border-border"
        )}>
          {toast.type === "success" && <Check className="h-5 w-5 text-emerald-600" />}
          {toast.type === "error" && <AlertTriangle className="h-5 w-5 text-destructive" />}
          {toast.type === "info" && <Bell className="h-5 w-5 text-foreground" />}
          <span className="text-sm font-medium text-foreground">{toast.message}</span>
        </div>
      )}
    </ThemeBackground>
  )
}
