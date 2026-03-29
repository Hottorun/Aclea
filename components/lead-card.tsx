"use client"

import { Clock, MapPin, Briefcase, Mail, Phone, Star, MessageCircle, Hand, Sparkles } from "lucide-react"
import type { Lead, LeadStatus, LeadSource } from "@/lib/types"
import { cn } from "@/lib/utils"

interface LeadCardProps {
  lead: Lead
  onClick: () => void
  isSelected: boolean
}

const statusConfig: Record<LeadStatus, { label: string; dotColor: string; textColor: string }> = {
  pending: {
    label: "Pending",
    dotColor: "bg-[var(--status-pending)]",
    textColor: "text-[var(--status-pending)]"
  },
  approved: {
    label: "Approved",
    dotColor: "bg-[var(--status-approved)]",
    textColor: "text-[var(--status-approved)]"
  },
  declined: {
    label: "Declined",
    dotColor: "bg-[var(--status-declined)]",
    textColor: "text-[var(--status-declined)]"
  },
  manual: {
    label: "Review",
    dotColor: "bg-[var(--status-manual)]",
    textColor: "text-[var(--status-manual)]"
  },
  active: {
    label: "Active",
    dotColor: "bg-[var(--status-pending)]",
    textColor: "text-[var(--status-pending)]"
  },
  completed: {
    label: "Completed",
    dotColor: "bg-[var(--status-approved)]",
    textColor: "text-[var(--status-approved)]"
  },
  cancelled: {
    label: "Cancelled",
    dotColor: "bg-muted-foreground",
    textColor: "text-muted-foreground"
  },
}

const sourceConfig: Record<LeadSource, { icon: any; label: string; iconColor: string }> = {
  whatsapp: { 
    icon: MessageCircle, 
    label: "WhatsApp",
    iconColor: "text-slate-400" 
  },
  email: { 
    icon: Mail, 
    label: "Email",
    iconColor: "text-slate-400" 
  },
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) return "Just now"
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
  return `${Math.floor(diffInSeconds / 86400)}d ago`
}

function getAiRecommendation(lead: Lead): { text: string; cta: string } {
  const rating = lead.rating ?? 0
  if (rating >= 4) {
    return { text: "High priority", cta: "Contact today" }
  }
  if (lead.status === "manual") {
    return { text: "Needs review", cta: "Review now" }
  }
  if (rating >= 3) {
    return { text: "Medium priority", cta: "Follow up" }
  }
  return { text: "Low priority", cta: "Nurture" }
}

export function LeadCard({ lead, onClick, isSelected }: LeadCardProps) {
  const status = statusConfig[lead.status ?? 'pending'] ?? statusConfig.pending
  const source = sourceConfig[lead.source ?? 'email']
  const SourceIcon = source.icon
  const aiRec = getAiRecommendation(lead)

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full rounded-lg border bg-card p-5 text-left transition-all duration-200 cursor-pointer hover:shadow-md hover:-translate-y-0.5",
        isSelected
          ? "border-foreground/30 shadow-md ring-1 ring-foreground/10"
          : "border-border hover:border-border/80"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
            {lead.name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .slice(0, 2)
              .toUpperCase()}
          </div>
          <div className="min-w-0">
            <h3 className="truncate font-medium text-card-foreground">{lead.name}</h3>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Briefcase className="h-3 w-3" />
              <span className="truncate">{lead.workType}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1.5 shrink-0">
          <div className="flex items-center gap-1.5">
            <span className={cn("h-1.5 w-1.5 rounded-full", status.dotColor)} />
            <span className={cn("text-xs font-medium", status.textColor)}>{status.label}</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <SourceIcon className="h-3 w-3" />
            {source.label}
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <div className="flex items-center gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={cn(
                "h-3 w-3",
                i < (lead.rating ?? 0) ? "text-foreground fill-foreground" : "text-border"
              )}
            />
          ))}
        </div>
        <span className="text-xs text-muted-foreground">{lead.rating ?? 0}/5</span>
      </div>

      {/* AI Recommendation */}
      <div className="mt-3 flex items-center justify-between gap-2 px-3 py-2 rounded-md border border-border bg-muted/40 text-xs">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Sparkles className="h-3 w-3 shrink-0" />
          <span className="font-medium text-foreground">{lead.ratingReason || aiRec.text}</span>
        </div>
        <span className="text-muted-foreground shrink-0">{aiRec.cta}</span>
      </div>

      <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <Phone className="h-3 w-3" />
          <span>{lead.phone}</span>
        </div>
        <div className="flex items-center gap-1.5 min-w-0">
          <Mail className="h-3 w-3 shrink-0" />
          <span className="truncate max-w-[130px]">{lead.email}</span>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground border-t border-border/50 pt-3">
        <div className="flex items-center gap-1.5">
          <MapPin className="h-3 w-3" />
          {lead.location}
        </div>
        <div className="flex items-center gap-1.5">
          <Clock className="h-3 w-3" />
          {formatTimeAgo(lead.createdAt)}
        </div>
      </div>
    </button>
  )
}
