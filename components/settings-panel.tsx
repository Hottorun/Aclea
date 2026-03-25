"use client"

import { useState } from "react"
import {
  X,
  Link,
  Clock,
  AlertTriangle,
  Trash2,
  Loader2,
  Settings,
  Database,
  Bell,
  Shield,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { cn } from "@/lib/utils"
import type { AppSettings } from "@/lib/types"

interface SettingsPanelProps {
  open: boolean
  onClose: () => void
  settings: AppSettings
  onUpdateSettings: (settings: Partial<AppSettings>) => Promise<void>
  onDeleteAllLeads: () => Promise<void>
  onDeleteOldDeclined: () => Promise<number>
}

type SettingsTab = "general" | "automation" | "danger"

const tabs: { id: SettingsTab; label: string; icon: typeof Settings }[] = [
  { id: "general", label: "General", icon: Settings },
  { id: "automation", label: "Automation", icon: Bell },
  { id: "danger", label: "Danger Zone", icon: Shield },
]

export function SettingsPanel({
  open,
  onClose,
  settings,
  onUpdateSettings,
  onDeleteAllLeads,
  onDeleteOldDeclined,
}: SettingsPanelProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>("general")
  const [webhookUrl, setWebhookUrl] = useState(settings.webhookUrl)
  const [autoDeleteDays, setAutoDeleteDays] = useState(settings.autoDeleteDeclinedDays.toString())
  const [autoDeleteEnabled, setAutoDeleteEnabled] = useState(settings.autoDeleteDeclinedDays > 0)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isDeletingOld, setIsDeletingOld] = useState(false)
  const [deletedCount, setDeletedCount] = useState<number | null>(null)
  const [hasChanges, setHasChanges] = useState(false)

  const handleWebhookChange = (value: string) => {
    setWebhookUrl(value)
    setHasChanges(true)
  }

  const handleAutoDeleteDaysChange = (value: string) => {
    setAutoDeleteDays(value)
    setHasChanges(true)
  }

  const handleAutoDeleteToggle = (enabled: boolean) => {
    setAutoDeleteEnabled(enabled)
    if (!enabled) {
      setAutoDeleteDays("0")
    } else if (autoDeleteDays === "0") {
      setAutoDeleteDays("30")
    }
    setHasChanges(true)
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await onUpdateSettings({
        webhookUrl,
        autoDeleteDeclinedDays: autoDeleteEnabled ? parseInt(autoDeleteDays) || 0 : 0,
      })
      setHasChanges(false)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteAll = async () => {
    setIsDeleting(true)
    try {
      await onDeleteAllLeads()
    } finally {
      setIsDeleting(false)
    }
  }

  const handleDeleteOldDeclined = async () => {
    setIsDeletingOld(true)
    try {
      const count = await onDeleteOldDeclined()
      setDeletedCount(count)
    } finally {
      setIsDeletingOld(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="relative flex h-[600px] w-full max-w-3xl overflow-hidden rounded-xl border border-border bg-card shadow-2xl">
        {/* Sidebar */}
        <div className="w-56 border-r border-border bg-secondary/30">
          <div className="flex h-14 items-center gap-2 border-b border-border px-4">
            <Settings className="h-5 w-5 text-muted-foreground" />
            <h2 className="font-semibold text-foreground">Settings</h2>
          </div>
          <nav className="p-2">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    activeTab === tab.id
                      ? "bg-primary text-primary-foreground"
                      : tab.id === "danger"
                        ? "text-destructive hover:bg-destructive/10"
                        : "text-muted-foreground hover:bg-secondary"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              )
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col">
          <div className="flex h-14 items-center justify-between border-b border-border px-6">
            <h3 className="font-medium text-foreground">
              {tabs.find((t) => t.id === activeTab)?.label}
            </h3>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {activeTab === "general" && (
              <div className="space-y-6">
                {/* Webhook Configuration */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Link className="h-4 w-4 text-muted-foreground" />
                    <Label className="text-sm font-medium">Webhook Configuration</Label>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="webhook-url" className="text-xs text-muted-foreground">
                      n8n Webhook URL
                    </Label>
                    <Input
                      id="webhook-url"
                      placeholder="https://your-n8n-instance.com/webhook/..."
                      value={webhookUrl}
                      onChange={(e) => handleWebhookChange(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Messages will be sent to this webhook when you approve or decline leads
                    </p>
                  </div>
                </div>

                <Separator />

                {/* Database Info */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Database className="h-4 w-4 text-muted-foreground" />
                    <Label className="text-sm font-medium">Database</Label>
                  </div>
                  <div className="rounded-lg bg-secondary/50 p-4">
                    <p className="text-sm text-muted-foreground">
                      Connected to Supabase via environment variables. Leads are stored in the
                      <code className="mx-1 rounded bg-secondary px-1 py-0.5 text-xs">leads</code>
                      table.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "automation" && (
              <div className="space-y-6">
                {/* Auto-delete Settings */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <Label className="text-sm font-medium">Auto-delete Declined Leads</Label>
                    </div>
                    <Switch
                      checked={autoDeleteEnabled}
                      onCheckedChange={handleAutoDeleteToggle}
                    />
                  </div>
                  
                  {autoDeleteEnabled && (
                    <div className="ml-6 space-y-3">
                      <div className="space-y-2">
                        <Label htmlFor="auto-delete-days" className="text-xs text-muted-foreground">
                          Delete after (days)
                        </Label>
                        <Input
                          id="auto-delete-days"
                          type="number"
                          min="1"
                          placeholder="30"
                          value={autoDeleteDays}
                          onChange={(e) => handleAutoDeleteDaysChange(e.target.value)}
                          className="w-32"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Declined leads older than {autoDeleteDays || "0"} days will be automatically removed.
                      </p>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleDeleteOldDeclined}
                        disabled={isDeletingOld}
                      >
                        {isDeletingOld ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Deleting...
                          </>
                        ) : (
                          <>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Old Declined Now
                          </>
                        )}
                      </Button>
                      
                      {deletedCount !== null && (
                        <p className="text-xs text-primary">
                          Deleted {deletedCount} old declined lead{deletedCount !== 1 ? "s" : ""}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === "danger" && (
              <div className="space-y-6">
                <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-destructive" />
                    <h4 className="font-medium text-destructive">Danger Zone</h4>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Actions in this section are irreversible. Please proceed with caution.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between rounded-lg border border-border p-4">
                    <div>
                      <h5 className="font-medium text-foreground">Delete All Leads</h5>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Permanently remove all leads from the database
                      </p>
                    </div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete All
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete all leads
                            from your database.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={handleDeleteAll}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            {isDeleting ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Deleting...
                              </>
                            ) : (
                              "Delete All Leads"
                            )}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between border-t border-border px-6 py-4">
            <p className="text-xs text-muted-foreground">
              {hasChanges ? "You have unsaved changes" : "All changes saved"}
            </p>
            <div className="flex gap-3">
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
              <Button onClick={handleSave} disabled={isSaving || !hasChanges}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
