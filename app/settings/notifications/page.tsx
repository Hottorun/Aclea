"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Bell, Check, AlertTriangle, Mail, MessageCircle, Clock, CheckCircle, XCircle, Phone, Smartphone } from "lucide-react"
import { ThemeBackground } from "@/lib/use-theme-gradient"
import { cn } from "@/lib/utils"

export default function NotificationsPage() {
  const router = useRouter()
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null)
  const [preferences, setPreferences] = useState({
    pushEnabled: true,
    emailEnabled: true,
    phoneEnabled: false,
    newLeads: true,
    leadApproved: true,
    leadDeclined: true,
    manualReview: true,
    dailySummary: false,
    weeklyReport: true,
  })

  useEffect(() => {
    const saved = localStorage.getItem("notificationPreferences")
    if (saved) {
      setPreferences(JSON.parse(saved))
    }
  }, [])

  const showToast = (message: string, type: "success" | "error" | "info" = "info") => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const handleToggle = (key: keyof typeof preferences) => {
    const newPrefs = { ...preferences, [key]: !preferences[key] }
    setPreferences(newPrefs)
    localStorage.setItem("notificationPreferences", JSON.stringify(newPrefs))
    showToast("Preferences saved", "success")
  }

  const handleSaveAll = () => {
    localStorage.setItem("notificationPreferences", JSON.stringify(preferences))
    showToast("All notification preferences saved", "success")
  }

  const notificationTypes = [
    {
      category: "Lead Notifications",
      items: [
        {
          key: "newLeads" as const,
          icon: MessageCircle,
          title: "New Leads",
          description: "Get notified when new leads come in",
          color: "text-emerald-500",
          bgColor: "bg-emerald-100",
        },
        {
          key: "leadApproved" as const,
          icon: CheckCircle,
          title: "Leads Approved",
          description: "Notifications when leads are approved",
          color: "text-blue-500",
          bgColor: "bg-blue-100",
        },
        {
          key: "leadDeclined" as const,
          icon: XCircle,
          title: "Leads Declined",
          description: "Notifications when leads are declined",
          color: "text-muted-foreground",
          bgColor: "bg-muted",
        },
        {
          key: "manualReview" as const,
          icon: Clock,
          title: "Manual Review Needed",
          description: "Reminders for leads requiring manual review",
          color: "text-amber-500",
          bgColor: "bg-amber-100",
        },
      ],
    },
    {
      category: "Reports",
      items: [
        {
          key: "dailySummary" as const,
          icon: Bell,
          title: "Daily Summary",
          description: "Receive a daily summary of lead activity",
          color: "text-purple-500",
          bgColor: "bg-purple-100",
        },
        {
          key: "weeklyReport" as const,
          icon: Mail,
          title: "Weekly Report",
          description: "Get weekly performance reports via email",
          color: "text-indigo-500",
          bgColor: "bg-indigo-100",
        },
      ],
    },
  ]

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
                  <span
                    className={cn(
                      "absolute top-1 w-4 h-4 bg-card rounded-full transition-transform",
                      preferences.pushEnabled ? "left-7" : "left-1"
                    )}
                  />
                </button>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-border bg-muted">
              <h3 className="text-sm font-medium text-foreground mb-4">Notification Channels</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100">
                      <Smartphone className="h-5 w-5 text-indigo-600" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Push Notifications</p>
                      <p className="text-sm text-muted-foreground">Browser/app notifications</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleToggle("pushEnabled")}
                    className={cn(
                      "relative w-12 h-6 rounded-full transition-colors cursor-pointer",
                      preferences.pushEnabled ? "bg-foreground" : "bg-border"
                    )}
                  >
                    <span
                      className={cn(
                        "absolute top-1 w-4 h-4 bg-card rounded-full transition-transform",
                        preferences.pushEnabled ? "left-7" : "left-1"
                      )}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100">
                      <Mail className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Email Notifications</p>
                      <p className="text-sm text-muted-foreground">Receive updates via email</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleToggle("emailEnabled")}
                    className={cn(
                      "relative w-12 h-6 rounded-full transition-colors cursor-pointer",
                      preferences.emailEnabled ? "bg-foreground" : "bg-border"
                    )}
                  >
                    <span
                      className={cn(
                        "absolute top-1 w-4 h-4 bg-card rounded-full transition-transform",
                        preferences.emailEnabled ? "left-7" : "left-1"
                      )}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100">
                      <Phone className="h-5 w-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">SMS/Phone Notifications</p>
                      <p className="text-sm text-muted-foreground">Receive updates via text message</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleToggle("phoneEnabled")}
                    className={cn(
                      "relative w-12 h-6 rounded-full transition-colors cursor-pointer",
                      preferences.phoneEnabled ? "bg-foreground" : "bg-border"
                    )}
                  >
                    <span
                      className={cn(
                        "absolute top-1 w-4 h-4 bg-card rounded-full transition-transform",
                        preferences.phoneEnabled ? "left-7" : "left-1"
                      )}
                    />
                  </button>
                </div>
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
                          isChannelEnabled
                            ? "border-border bg-card hover:border-border/80"
                            : "border-border bg-muted opacity-60"
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
                            <span
                              className={cn(
                                "absolute top-1 w-4 h-4 bg-card rounded-full transition-transform",
                                isEnabled && isChannelEnabled ? "left-7" : "left-1"
                              )}
                            />
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}

            <div className="pt-4 border-t border-border">
              <button
                onClick={handleSaveAll}
                className="w-full px-4 py-2.5 bg-foreground text-background text-sm font-medium rounded-lg hover:bg-foreground/90 transition-colors cursor-pointer"
              >
                Save Preferences
              </button>
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
