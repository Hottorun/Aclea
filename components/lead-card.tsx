"use client"

import { Clock, User, MessageSquare } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import type { Lead, LeadStatus, LeadTag } from "@/lib/types"
import { cn } from "@/lib/utils"

interface LeadCardProps {
  lead: Lead
  onClick: () => void
  isSelected: boolean
}

const statusConfig: Record<LeadStatus, { label: string; className: string }> = {
  new: { label: "New", className: "bg-primary/20 text-primary border-primary/30" },
  contacted: { label: "Contacted", className: "bg-chart-2/20 text-chart-2 border-chart-2/30" },
  qualified: { label: "Qualified", className: "bg-chart-3/20 text-chart-3 border-chart-3/30" },
  converted: { label: "Converted", className: "bg-primary/20 text-primary border-primary/30" },
  lost: { label: "Lost", className: "bg-destructive/20 text-destructive border-destructive/30" },
}

const tagConfig: Record<LeadTag, { label: string; className: string }> = {
  hot: { label: "Hot", className: "bg-destructive/20 text-destructive" },
  warm: { label: "Warm", className: "bg-chart-3/20 text-chart-3" },
  cold: { label: "Cold", className: "bg-chart-2/20 text-chart-2" },
  vip: { label: "VIP", className: "bg-chart-4/20 text-chart-4" },
  "follow-up": { label: "Follow-up", className: "bg-chart-5/20 text-chart-5" },
  urgent: { label: "Urgent", className: "bg-destructive/20 text-destructive" },
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

export function LeadCard({ lead, onClick, isSelected }: LeadCardProps) {
  const status = statusConfig[lead.status]

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full rounded-xl border bg-card p-4 text-left transition-all hover:border-primary/50",
        isSelected ? "border-primary ring-1 ring-primary" : "border-border"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary text-sm font-medium text-foreground">
            {lead.name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .slice(0, 2)
              .toUpperCase()}
          </div>
          <div className="min-w-0">
            <h3 className="truncate font-medium text-card-foreground">{lead.name}</h3>
            <p className="truncate text-sm text-muted-foreground">{lead.phone}</p>
          </div>
        </div>
        <Badge variant="outline" className={cn("shrink-0 text-xs", status.className)}>
          {status.label}
        </Badge>
      </div>

      <div className="mt-3 flex items-start gap-2">
        <MessageSquare className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
        <p className="line-clamp-2 text-sm text-muted-foreground">{lead.message}</p>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {lead.tags.map((tag) => {
          const config = tagConfig[tag]
          return (
            <span
              key={tag}
              className={cn("rounded-md px-2 py-0.5 text-xs font-medium", config.className)}
            >
              {config.label}
            </span>
          )
        })}
      </div>

      <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5" />
          {formatTimeAgo(lead.createdAt)}
        </div>
        {lead.assignedTo && (
          <div className="flex items-center gap-1.5">
            <User className="h-3.5 w-3.5" />
            {lead.assignedTo}
          </div>
        )}
      </div>
    </button>
  )
}
