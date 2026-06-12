"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Check, AlertTriangle, Loader2, X, Plus, Bot, FileText, Mic2, List, GitBranch } from "lucide-react"
import { ThemeBackground } from "@/lib/use-theme-gradient"
import { cn } from "@/lib/utils"
import { useUser } from "@/lib/use-user"
import type { TeamConfig } from "@/lib/types"

const TONE_OPTIONS = [
  { value: "professional", label: "Professional" },
  { value: "friendly", label: "Friendly" },
  { value: "formal", label: "Formal" },
  { value: "casual", label: "Casual" },
]

const FLOW_OPTIONS = [
  { value: "qualification", label: "Qualification" },
  { value: "support", label: "Support" },
  { value: "sales", label: "Sales" },
]

export default function AIConfigPage() {
  const router = useRouter()
  const { user, loading: userLoading } = useUser()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null)
  const [config, setConfig] = useState<TeamConfig | null>(null)
  const [newField, setNewField] = useState("")
  const [rulesError, setRulesError] = useState<string | null>(null)
  const [rulesText, setRulesText] = useState("")
  const fieldInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!userLoading && !user) router.push("/login")
  }, [user, userLoading, router])

  useEffect(() => {
    if (userLoading || !user?.teamId) return
    fetch("/api/settings/ai-config")
      .then(res => res.json())
      .then(data => {
        if (!data.error) {
          setConfig(data)
          setRulesText(JSON.stringify(data.qualificationRules ?? {}, null, 2))
        }
      })
      .catch(console.error)
      .finally(() => setIsLoading(false))
  }, [user?.teamId, userLoading])

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const save = async (patch: Partial<TeamConfig>) => {
    if (!config) return
    setIsSaving(true)
    try {
      const res = await fetch("/api/settings/ai-config", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      })
      if (res.ok) {
        const updated = await res.json()
        setConfig(updated)
        showToast("Saved", "success")
      } else {
        showToast("Failed to save", "error")
      }
    } catch {
      showToast("Error saving", "error")
    } finally {
      setIsSaving(false)
    }
  }

  const addField = () => {
    const trimmed = newField.trim().toLowerCase().replace(/\s+/g, "_")
    if (!trimmed || !config) return
    if (config.requiredFields.includes(trimmed)) { setNewField(""); return }
    const updated = [...config.requiredFields, trimmed]
    setConfig({ ...config, requiredFields: updated })
    setNewField("")
    save({ requiredFields: updated })
  }

  const removeField = (field: string) => {
    if (!config) return
    const updated = config.requiredFields.filter(f => f !== field)
    setConfig({ ...config, requiredFields: updated })
    save({ requiredFields: updated })
  }

  const handleRulesBlur = () => {
    if (!config) return
    try {
      const parsed = JSON.parse(rulesText)
      setRulesError(null)
      save({ qualificationRules: parsed })
    } catch {
      setRulesError("Invalid JSON")
    }
  }

  if (userLoading || isLoading || !config) {
    return (
      <ThemeBackground className="p-6">
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </ThemeBackground>
    )
  }

  if (!user) return null

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
          <div className="px-6 py-4 border-b border-border bg-muted flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-foreground">AI Qualification Config</h1>
              <p className="text-sm text-muted-foreground mt-1">Configure how the chatbot qualifies incoming leads</p>
            </div>
            {isSaving && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
          </div>

          <div className="p-6 space-y-6">

            {/* System Prompt */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-medium text-foreground">System Prompt</h3>
              </div>
              <p className="text-xs text-muted-foreground mb-3">
                Instructions for the AI on how to handle leads. Be specific about your business context.
              </p>
              <textarea
                value={config.aiSystemPrompt}
                onChange={e => setConfig({ ...config, aiSystemPrompt: e.target.value })}
                onBlur={() => save({ aiSystemPrompt: config.aiSystemPrompt })}
                rows={6}
                placeholder="Du bist ein freundlicher Assistent für unser Unternehmen. Hilf dabei, Anfragen zu qualifizieren..."
                className="w-full px-3 py-2 rounded-lg border border-border bg-background resize-none focus:border-foreground/30 focus:outline-none text-foreground placeholder:text-muted-foreground text-sm"
              />
            </div>

            {/* Tone of Voice */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Mic2 className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-medium text-foreground">Tone of Voice</h3>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {TONE_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => { setConfig({ ...config, toneOfVoice: opt.value }); save({ toneOfVoice: opt.value }) }}
                    className={cn(
                      "px-3 py-2 rounded-lg border text-sm font-medium transition-colors cursor-pointer",
                      config.toneOfVoice === opt.value
                        ? "border-foreground bg-foreground text-background"
                        : "border-border bg-card text-foreground hover:bg-muted"
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Flow Type */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <GitBranch className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-medium text-foreground">Flow Type</h3>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {FLOW_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => { setConfig({ ...config, flowType: opt.value }); save({ flowType: opt.value }) }}
                    className={cn(
                      "px-3 py-2 rounded-lg border text-sm font-medium transition-colors cursor-pointer",
                      config.flowType === opt.value
                        ? "border-foreground bg-foreground text-background"
                        : "border-border bg-card text-foreground hover:bg-muted"
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Required Fields */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <List className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-medium text-foreground">Required Fields</h3>
              </div>
              <p className="text-xs text-muted-foreground mb-3">
                The AI will keep asking until all these fields are collected from the lead.
              </p>
              <div className="flex flex-wrap gap-2 mb-3">
                {config.requiredFields.map(field => (
                  <span
                    key={field}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-border bg-muted text-sm text-foreground"
                  >
                    {field}
                    <button
                      onClick={() => removeField(field)}
                      className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
                {config.requiredFields.length === 0 && (
                  <p className="text-sm text-muted-foreground">No required fields — the AI will close immediately.</p>
                )}
              </div>
              <div className="flex gap-2">
                <input
                  ref={fieldInputRef}
                  value={newField}
                  onChange={e => setNewField(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && addField()}
                  placeholder="e.g. phone, budget, location"
                  className="flex-1 px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:border-foreground/30 focus:outline-none"
                />
                <button
                  onClick={addField}
                  disabled={!newField.trim()}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border bg-card text-sm font-medium text-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                  Add
                </button>
              </div>
            </div>

            {/* Qualification Rules */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Bot className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-medium text-foreground">Qualification Rules</h3>
              </div>
              <p className="text-xs text-muted-foreground mb-3">
                JSON object passed to the AI for rating leads. Define criteria like min budget, accepted regions, etc.
              </p>
              <textarea
                value={rulesText}
                onChange={e => { setRulesText(e.target.value); setRulesError(null) }}
                onBlur={handleRulesBlur}
                rows={6}
                placeholder={'{\n  "min_budget": 1000,\n  "accepted_regions": ["Berlin", "Hamburg"],\n  "project_types": ["renovation", "new build"]\n}'}
                className={cn(
                  "w-full px-3 py-2 rounded-lg border bg-background resize-none focus:outline-none text-foreground placeholder:text-muted-foreground text-sm font-mono",
                  rulesError ? "border-destructive focus:border-destructive" : "border-border focus:border-foreground/30"
                )}
              />
              {rulesError && (
                <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" /> {rulesError}
                </p>
              )}
            </div>

          </div>
        </div>
      </div>

      {toast && (
        <div className={cn(
          "fixed bottom-6 right-6 flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border transition-all",
          toast.type === "success" ? "bg-card border-border" : "bg-destructive/10 border-destructive/30"
        )}>
          {toast.type === "success"
            ? <Check className="h-5 w-5 text-emerald-600" />
            : <AlertTriangle className="h-5 w-5 text-destructive" />}
          <span className="text-sm font-medium text-foreground">{toast.message}</span>
        </div>
      )}
    </ThemeBackground>
  )
}
