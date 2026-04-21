"use client"

import { useState, useRef, useEffect } from "react"
import useSWR from "swr"
import { useRouter } from "next/navigation"
import { AppHeader } from "@/components/app-header"
import { useUser } from "@/lib/use-user"
import { cn } from "@/lib/utils"
import type { Lead } from "@/lib/types"
import { getSafeString } from "@/lib/lead-utils"
import {
  Search,
  Send,
  Paperclip,
  Smile,
  MessageSquare,
  ExternalLink,
  Check,
  Sparkles,
  ChevronDown,
  ChevronUp,
  ClipboardCopy,
  Mail,
  MessageCircle,
  Reply,
  AtSign,
} from "lucide-react"

// ─── Types ────────────────────────────────────────────────────────────────────

type LocalMessage = {
  id: number
  from: "me" | "client" | "system"
  text: string
  time: string
}

type ConversationMap = Record<string, LocalMessage[]>

// ─── Constants ────────────────────────────────────────────────────────────────

const AVATAR_PALETTE = [
  { bg: "#D1FAE5", text: "#065F46" },
  { bg: "#FEF9C3", text: "#713F12" },
  { bg: "#FCE7F3", text: "#831843" },
  { bg: "#E0E7FF", text: "#3730A3" },
  { bg: "#DBEAFE", text: "#1E3A8A" },
  { bg: "#FEE2E2", text: "#7F1D1D" },
]

const TEMPLATES = [
  {
    label: "👋 Introduction",
    text: "Hi {name}, I'm reaching out because your profile caught our attention. We'd love to explore how we can work together. Would you be open to a brief chat?",
  },
  {
    label: "📅 Schedule a call",
    text: "Hi {name}, I'd love to set up a quick call to learn more about {company}'s goals. Are you free for 20 minutes this week?",
  },
  {
    label: "📄 Send proposal",
    text: "Hi {name}, following our conversation, I've put together a proposal tailored for {company}. I'll send it over shortly — let me know if you have any questions.",
  },
  {
    label: "🙏 Follow up",
    text: "Hi {name}, just following up on my previous message. I'd love to connect when the time is right for you.",
  },
  {
    label: "✅ Confirm meeting",
    text: "Hi {name}, just confirming our meeting — looking forward to speaking with you. Let me know if anything changes on your end.",
  },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fetcher = (url: string) => fetch(url).then((res) => res.json())

function getAvatarStyle(name: string): { bg: string; text: string } {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return AVATAR_PALETTE[Math.abs(hash) % AVATAR_PALETTE.length]
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase()
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
}

function getChannel(lead: Lead): "WhatsApp" | "Email" {
  return lead.phone ? "WhatsApp" : "Email"
}

function normalizeScore(lead: Lead): number {
  const raw = lead.session?.rating ?? lead.rating ?? 0
  if (raw <= 5) return raw * 20
  return raw
}

function getScoreColor(score: number): string {
  if (score >= 80) return "#16A34A"
  if (score >= 60) return "#D97706"
  return "#DC2626"
}

function getCompany(lead: Lead): string {
  const cd = lead.session?.collectedData
  if (cd && !Array.isArray(cd) && cd.company) return getSafeString(cd.company)
  return ""
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
}

function isApprovedLead(lead: Lead): boolean {
  return lead.session?.status === "approved" || lead.status === "approved"
}

function buildInitialConversations(leads: Lead[]): ConversationMap {
  const map: ConversationMap = {}
  for (const lead of leads) {
    map[lead.id] = [
      {
        id: 1,
        from: "system",
        text: "Lead approved by AI",
        time: formatTime(new Date(lead.updatedAt || lead.createdAt)),
      },
    ]
  }
  return map
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Avatar({
  name,
  size = 36,
}: {
  name: string
  size?: number
}) {
  const { bg, text } = getAvatarStyle(name)
  return (
    <div
      style={{
        width: size,
        height: size,
        backgroundColor: bg,
        color: text,
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: size * 0.36,
        fontWeight: 700,
        flexShrink: 0,
      }}
    >
      {getInitials(name)}
    </div>
  )
}

function SystemDivider({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2 py-2 px-4">
      <div className="flex-1 h-px bg-border" />
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <div className="flex h-4 w-4 items-center justify-center rounded-full bg-green-100 dark:bg-green-950">
          <Check className="h-2.5 w-2.5 text-green-600 dark:text-green-400" />
        </div>
        {text}
      </div>
      <div className="flex-1 h-px bg-border" />
    </div>
  )
}

function AIContextBox({
  lead,
  onInsert,
}: {
  lead: Lead
  onInsert: (text: string) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const [copied, setCopied] = useState(false)

  const cd = lead.session?.collectedData
  const ratingReason = lead.session?.ratingReason ?? lead.ratingReason
  const summary = cd?.conversationSummary ?? lead.conversationSummary

  const dataFields: { label: string; value: string }[] = []
  if (cd?.workType || lead.workType) dataFields.push({ label: "Work type", value: getSafeString(cd?.workType ?? lead.workType) })
  if (cd?.location || lead.location) dataFields.push({ label: "Location", value: getSafeString(cd?.location ?? lead.location) })
  if (cd?.budget) dataFields.push({ label: "Budget", value: getSafeString(cd.budget) })
  if (cd?.timeline) dataFields.push({ label: "Timeline", value: getSafeString(cd.timeline) })
  if (cd?.message) dataFields.push({ label: "Initial message", value: getSafeString(cd.message) })

  const hasContent = ratingReason || summary || dataFields.length > 0
  if (!hasContent) return null

  const contextText = [
    summary ? `Summary: ${summary}` : null,
    ratingReason ? `AI rating reason: ${ratingReason}` : null,
    ...dataFields.map((f) => `${f.label}: ${f.value}`),
  ]
    .filter(Boolean)
    .join("\n")

  function handleCopy() {
    navigator.clipboard.writeText(contextText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="mx-4 my-2 rounded-xl border border-[#5c3fff]/30 bg-[#5c3fff]/5 overflow-hidden">
      {/* Header row — always visible */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center gap-2 px-3.5 py-2.5 text-left hover:bg-[#5c3fff]/10 transition-colors"
      >
        <Sparkles className="h-3.5 w-3.5 shrink-0" style={{ color: "#5c3fff" }} />
        <span className="flex-1 text-xs font-semibold" style={{ color: "#5c3fff" }}>
          AI Context — see what the AI handled before you
        </span>
        {expanded ? (
          <ChevronUp className="h-3.5 w-3.5 shrink-0" style={{ color: "#5c3fff" }} />
        ) : (
          <ChevronDown className="h-3.5 w-3.5 shrink-0" style={{ color: "#5c3fff" }} />
        )}
      </button>

      {/* Expanded body */}
      {expanded && (
        <div className="px-3.5 pb-3.5 space-y-3">
          {summary && (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mb-1">
                Conversation Summary
              </p>
              <p className="text-xs text-foreground leading-relaxed">{summary}</p>
            </div>
          )}

          {ratingReason && (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mb-1">
                AI Rating Reason
              </p>
              <p className="text-xs text-foreground leading-relaxed">{ratingReason}</p>
            </div>
          )}

          {dataFields.length > 0 && (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">
                Collected Data
              </p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                {dataFields.map((f) => (
                  <div key={f.label}>
                    <span className="text-[10px] text-muted-foreground">{f.label}: </span>
                    <span className="text-[10px] font-medium text-foreground">{f.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action row */}
          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={() => onInsert(contextText)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: "#5c3fff" }}
            >
              <Send className="h-3 w-3" />
              Insert into message
            </button>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-border hover:bg-muted transition-colors"
            >
              <ClipboardCopy className="h-3 w-3" />
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Email message card ───────────────────────────────────────────────────────

function EmailMessageCard({
  msg,
  lead,
  isFirst,
}: {
  msg: LocalMessage
  lead: Lead
  isFirst?: boolean
}) {
  const [collapsed, setCollapsed] = useState(!isFirst && msg.from !== "me")
  const isSent = msg.from === "me"

  const fromLabel = isSent ? "You" : lead.name
  const fromEmail = isSent ? null : lead.email
  const toLabel = isSent ? lead.name : "You"
  const preview = msg.text.slice(0, 80) + (msg.text.length > 80 ? "…" : "")

  return (
    <div className="border border-border rounded-xl bg-background overflow-hidden shadow-sm">
      {/* Email card header — always visible */}
      <button
        onClick={() => setCollapsed((v) => !v)}
        className="w-full flex items-start gap-3 px-4 py-3 hover:bg-muted/40 transition-colors text-left"
      >
        <Avatar name={fromLabel} size={32} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-semibold truncate">
              {fromLabel}
              {fromEmail && (
                <span className="font-normal text-muted-foreground ml-1 text-xs">
                  &lt;{fromEmail}&gt;
                </span>
              )}
            </span>
            <span className="text-[11px] text-muted-foreground shrink-0">{msg.time}</span>
          </div>
          {collapsed ? (
            <p className="text-xs text-muted-foreground truncate mt-0.5">{preview}</p>
          ) : (
            <p className="text-xs text-muted-foreground mt-0.5">
              to <span className="font-medium text-foreground">{toLabel}</span>
            </p>
          )}
        </div>
        <ChevronDown
          className={cn("h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5 transition-transform", !collapsed && "rotate-180")}
        />
      </button>

      {/* Expanded body */}
      {!collapsed && (
        <div className="px-4 pb-4 pt-1">
          <div className="border-t border-border/60 pt-3">
            <p className="text-sm leading-relaxed whitespace-pre-wrap break-words text-foreground">
              {msg.text}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function MessagesPage() {
  const router = useRouter()
  const { user } = useUser()
  const { data: leadsData } = useSWR<Lead[]>("/api/leads", fetcher, {
    refreshInterval: 30000,
  })

  const allLeads = Array.isArray(leadsData) ? leadsData : []
  const approvedLeads = allLeads.filter(isApprovedLead)

  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [conversations, setConversations] = useState<ConversationMap>({})
  const [composerText, setComposerText] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Initialise conversations once approved leads are loaded
  useEffect(() => {
    if (approvedLeads.length > 0 && Object.keys(conversations).length === 0) {
      setConversations(buildInitialConversations(approvedLeads))
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [approvedLeads.length])

  // Auto-scroll to bottom when messages change or lead changes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [selectedLeadId, conversations])

  const selectedLead = selectedLeadId
    ? approvedLeads.find((l) => l.id === selectedLeadId) ?? null
    : null

  const filteredLeads = approvedLeads.filter((lead) => {
    const q = searchQuery.toLowerCase()
    if (!q) return true
    return (
      lead.name.toLowerCase().includes(q) ||
      getCompany(lead).toLowerCase().includes(q) ||
      lead.email?.toLowerCase().includes(q)
    )
  })

  const messages: LocalMessage[] = selectedLeadId
    ? (conversations[selectedLeadId] ?? [])
    : []

  function sendMessage(text: string) {
    if (!selectedLeadId || !text.trim()) return
    const newMsg: LocalMessage = {
      id: Date.now(),
      from: "me",
      text: text.trim(),
      time: formatTime(new Date()),
    }
    setConversations((prev) => ({
      ...prev,
      [selectedLeadId]: [...(prev[selectedLeadId] ?? []), newMsg],
    }))
    setComposerText("")
    textareaRef.current?.focus()
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage(composerText)
    }
  }

  function insertContext(text: string) {
    setComposerText((prev) => (prev ? `${prev}\n\n${text}` : text))
    textareaRef.current?.focus()
  }

  function applyTemplate(template: (typeof TEMPLATES)[number]) {
    if (!selectedLead) return
    const company = getCompany(selectedLead) || selectedLead.name
    const filled = template.text
      .replace(/{name}/g, selectedLead.name)
      .replace(/{company}/g, company)
    setComposerText(filled)
    textareaRef.current?.focus()
  }

  function handleViewLead(lead: Lead) {
    router.push(`/leads?id=${lead.id}`)
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <AppHeader
        onRefresh={() => {}}
        isRefreshing={false}
        user={user ?? undefined}
        leads={allLeads}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* ── Sidebar ─────────────────────────────────────────────────────── */}
        <aside className="w-[300px] shrink-0 bg-background border-r border-border flex flex-col overflow-hidden">
          {/* Sidebar header */}
          <div className="px-4 pt-4 pb-3 border-b border-border shrink-0">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold">Approved Clients</h2>
              <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full font-medium">
                {approvedLeads.length}
              </span>
            </div>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                placeholder="Search clients..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-sm bg-muted border border-border rounded-lg focus:outline-none focus:border-foreground transition-colors placeholder:text-muted-foreground"
              />
            </div>
          </div>

          {/* Client list */}
          <div className="flex-1 overflow-y-auto">
            {approvedLeads.length === 0 ? (
              <div className="px-4 py-10 text-center">
                <MessageSquare className="h-8 w-8 mx-auto mb-2 text-muted-foreground/40" />
                <p className="text-sm font-medium text-muted-foreground">No approved leads yet</p>
                <p className="text-xs text-muted-foreground/70 mt-1">
                  Once the AI approves leads, they'll appear here.
                </p>
              </div>
            ) : filteredLeads.length === 0 ? (
              <div className="px-4 py-10 text-center">
                <p className="text-sm text-muted-foreground">No results for "{searchQuery}"</p>
              </div>
            ) : (
              filteredLeads.map((lead) => {
                const isActive = lead.id === selectedLeadId
                const score = normalizeScore(lead)
                const scoreColor = getScoreColor(score)
                const company = getCompany(lead)
                const hasUnread = false // local state — extend as needed

                return (
                  <button
                    key={lead.id}
                    onClick={() => setSelectedLeadId(lead.id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-3 text-left border-b border-border transition-colors relative",
                      isActive
                        ? "bg-muted"
                        : "hover:bg-muted/50"
                    )}
                  >
                    {/* Active indicator */}
                    {isActive && (
                      <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-foreground rounded-r" />
                    )}

                    <Avatar name={lead.name} size={36} />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-sm font-medium truncate">{lead.name}</span>
                        {/* Score pill */}
                        <span
                          className="text-[10px] font-semibold shrink-0 px-1.5 py-0.5 rounded-full"
                          style={{ color: scoreColor, backgroundColor: `${scoreColor}18` }}
                        >
                          {score}%
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        {getChannel(lead) === "WhatsApp" ? (
                          <MessageCircle className="h-3 w-3 shrink-0 text-green-600 dark:text-green-400" />
                        ) : (
                          <Mail className="h-3 w-3 shrink-0 text-blue-500 dark:text-blue-400" />
                        )}
                        <p className="text-xs text-muted-foreground truncate">
                          {company || lead.email || "—"}
                        </p>
                      </div>
                    </div>

                    {/* Unread dot */}
                    {hasUnread && (
                      <div className="h-2 w-2 rounded-full bg-foreground shrink-0" />
                    )}
                  </button>
                )
              })
            )}
          </div>
        </aside>

        {/* ── Chat area ───────────────────────────────────────────────────── */}
        <div className="flex-1 flex flex-col overflow-hidden bg-muted/30">
          {selectedLead === null ? (
            /* Empty state */
            <div className="flex-1 flex flex-col items-center justify-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted border border-border">
                <MessageSquare className="h-6 w-6 text-muted-foreground" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium">No conversation selected</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Select a client from the sidebar to start messaging
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Chat header */}
              <ChatHeader
                lead={selectedLead}
                onViewLead={() => handleViewLead(selectedLead)}
              />

              {/* Messages thread */}
              {getChannel(selectedLead) === "Email" ? (
                /* ── Email thread layout ─────────────────────────────── */
                <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
                  {messages.map((msg, i) => {
                    if (msg.from === "system") {
                      return (
                        <div key={msg.id}>
                          <SystemDivider text={msg.text} />
                          <AIContextBox lead={selectedLead} onInsert={insertContext} />
                        </div>
                      )
                    }
                    const nonSystemMsgs = messages.filter((m) => m.from !== "system")
                    const isFirst = msg.id === nonSystemMsgs[0]?.id
                    return (
                      <EmailMessageCard
                        key={msg.id}
                        msg={msg}
                        lead={selectedLead}
                        isFirst={isFirst}
                      />
                    )
                  })}
                  <div ref={messagesEndRef} />
                </div>
              ) : (
                /* ── WhatsApp chat bubbles ────────────────────────────── */
                <div className="flex-1 overflow-y-auto px-6 py-4 space-y-1">
                  {messages.map((msg) => {
                    if (msg.from === "system") {
                      return (
                        <div key={msg.id}>
                          <SystemDivider text={msg.text} />
                          <AIContextBox lead={selectedLead} onInsert={insertContext} />
                        </div>
                      )
                    }

                    const isSent = msg.from === "me"
                    return (
                      <div
                        key={msg.id}
                        className={cn(
                          "flex items-end gap-2 max-w-[75%]",
                          isSent ? "ml-auto flex-row-reverse" : "mr-auto"
                        )}
                      >
                        {!isSent && (
                          <div className="mb-1 shrink-0">
                            <Avatar name={selectedLead.name} size={24} />
                          </div>
                        )}
                        <div>
                          <div
                            className={cn(
                              isSent
                                ? "bg-foreground text-background rounded-2xl rounded-br-sm px-3.5 py-2.5"
                                : "bg-background border border-border rounded-2xl rounded-bl-sm px-3.5 py-2.5"
                            )}
                          >
                            <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                              {msg.text}
                            </p>
                          </div>
                          <p
                            className={cn(
                              "text-[10px] text-muted-foreground mt-1",
                              isSent ? "text-right" : "text-left"
                            )}
                          >
                            {msg.time}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                  <div ref={messagesEndRef} />
                </div>
              )}

              {/* Template chips */}
              <div className="px-4 py-2 border-t border-border shrink-0">
                <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                  {TEMPLATES.map((tpl) => (
                    <button
                      key={tpl.label}
                      onClick={() => applyTemplate(tpl)}
                      className="border border-border rounded-full px-3 py-1 text-xs font-semibold hover:border-foreground hover:bg-muted transition-colors whitespace-nowrap shrink-0"
                    >
                      {tpl.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Composer */}
              <div className="px-4 pb-4 pt-2 shrink-0">
                <div className="bg-background border-2 border-border rounded-2xl focus-within:border-foreground transition-colors">
                  {/* Email: show To header */}
                  {getChannel(selectedLead) === "Email" && (
                    <div className="flex items-center gap-2 px-4 pt-3 pb-2 border-b border-border/60">
                      <Reply className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      <span className="text-xs text-muted-foreground">Reply to</span>
                      <div className="flex items-center gap-1.5 bg-muted rounded-full px-2.5 py-1">
                        <AtSign className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs font-medium">{selectedLead.email || selectedLead.name}</span>
                      </div>
                    </div>
                  )}
                  <textarea
                    ref={textareaRef}
                    value={composerText}
                    onChange={(e) => setComposerText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={
                      getChannel(selectedLead) === "Email"
                        ? `Write your reply to ${selectedLead.name}...`
                        : `Message ${selectedLead.name}...`
                    }
                    rows={3}
                    className="w-full px-4 pt-3 pb-1 text-sm bg-transparent resize-none focus:outline-none placeholder:text-muted-foreground"
                  />
                  <div className="flex items-center justify-between px-3 pb-2.5 pt-1">
                    <div className="flex items-center gap-1">
                      <button className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors">
                        <Paperclip className="h-4 w-4" />
                      </button>
                      {getChannel(selectedLead) === "WhatsApp" && (
                        <button className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors">
                          <Smile className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[11px] text-muted-foreground hidden sm:block">
                        ↵ Enter to send
                      </span>
                      <button
                        onClick={() => sendMessage(composerText)}
                        disabled={!composerText.trim()}
                        className="bg-foreground text-background rounded-xl px-4 py-2 text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 transition-opacity"
                      >
                        {getChannel(selectedLead) === "Email" ? (
                          <Reply className="h-3.5 w-3.5" />
                        ) : (
                          <Send className="h-3.5 w-3.5" />
                        )}
                        {getChannel(selectedLead) === "Email" ? "Reply" : "Send"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Chat Header ─────────────────────────────────────────────────────────────

function ChatHeader({
  lead,
  onViewLead,
}: {
  lead: Lead
  onViewLead: () => void
}) {
  const channel = getChannel(lead)
  const score = normalizeScore(lead)
  const scoreColor = getScoreColor(score)
  const company = getCompany(lead)

  return (
    <div className="flex items-center gap-3 px-5 py-3.5 bg-background border-b border-border shrink-0">
      <Avatar name={lead.name} size={40} />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-semibold">{lead.name}</span>
          {/* Channel badge */}
          <span
            className={cn(
              "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border",
              channel === "WhatsApp"
                ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-400 dark:border-green-800"
                : "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-400 dark:border-blue-800"
            )}
          >
            {channel}
          </span>
        </div>
        <p className="text-xs text-muted-foreground truncate mt-0.5">
          {[company, lead.email].filter(Boolean).join(" · ")}
        </p>
      </div>

      {/* AI score pill */}
      <div className="flex items-center gap-1.5 px-2.5 py-1 bg-muted border border-border rounded-lg text-xs font-semibold shrink-0">
        <div
          className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white shrink-0"
          style={{ backgroundColor: scoreColor }}
        >
          AI
        </div>
        <span style={{ color: scoreColor }}>{score}%</span>
      </div>

      {/* View Lead button */}
      <button
        onClick={onViewLead}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold border border-border rounded-lg hover:bg-muted transition-colors shrink-0"
      >
        <ExternalLink className="h-3.5 w-3.5" />
        View Lead
      </button>
    </div>
  )
}
