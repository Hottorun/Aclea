"use client"

import { LeadCard } from "./lead-card"
import { Mail, Sparkles } from "lucide-react"
import type { Lead, LeadStatus } from "@/lib/types"
import { cn } from "@/lib/utils"

interface LeadsGridProps {
  leads: Lead[]
  searchQuery: string
  selectedLeadId: string | null
  onSelectLead: (lead: Lead) => void
  viewMode?: "grid" | "list"
}

export function LeadsGrid({
  leads,
  searchQuery,
  selectedLeadId,
  onSelectLead,
  viewMode = "grid",
}: LeadsGridProps) {
  const sortByPriority = (a: Lead, b: Lead) => {
    const aScore = (a.rating ?? 0) * 10 + (a.status === "manual" ? 5 : 0) + (a.isLoyal ? 3 : 0)
    const bScore = (b.rating ?? 0) * 10 + (b.status === "manual" ? 5 : 0) + (b.isLoyal ? 3 : 0)
    return bScore - aScore
  }

  const getAiRec = (lead: Lead) => {
    const rating = lead.rating ?? 0
    if (rating >= 4) return { text: "High" }
    if (lead.status === "manual") return { text: "Review" }
    if (rating >= 3) return { text: "Medium" }
    return { text: "Low" }
  }

  const displayLeads = leads
    .filter((lead) => {
      if (!searchQuery) return true
      const query = searchQuery.toLowerCase()
      return (
        lead.name.toLowerCase().includes(query) ||
        lead.phone.toLowerCase().includes(query) ||
        lead.email.toLowerCase().includes(query) ||
        (lead.location?.toLowerCase().includes(query) ?? false) ||
        (lead.workType?.toLowerCase().includes(query) ?? false) ||
        (lead.conversationSummary?.toLowerCase().includes(query) ?? false)
      )
    })
    .sort(sortByPriority)

  if (displayLeads.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/20 py-16">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
          <svg
            className="h-7 w-7 text-muted-foreground"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
            />
          </svg>
        </div>
        <h3 className="mt-4 text-base font-medium text-foreground">No leads found</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          {searchQuery
            ? "Try adjusting your search"
            : "New leads will appear here"}
        </p>
      </div>
    )
  }

  if (viewMode === "list") {
    return (
      <div className="space-y-1.5">
        {displayLeads.map((lead) => (
          <button
            key={lead.id}
            onClick={() => onSelectLead(lead)}
            className={cn(
              "w-full flex items-center gap-4 rounded-lg border bg-card p-3.5 text-left transition-all duration-200 cursor-pointer",
              selectedLeadId === lead.id
                ? "border-foreground/30 shadow-sm ring-1 ring-foreground/10"
                : "border-border hover:border-border/80 hover:bg-muted/30"
            )}
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
              {lead.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-medium text-card-foreground truncate">{lead.name}</h3>
                <span className={cn(
                  "h-1.5 w-1.5 rounded-full shrink-0",
                  lead.status === "approved" ? "bg-[var(--status-approved)]" :
                  lead.status === "declined" ? "bg-[var(--status-declined)]" :
                  lead.status === "manual" ? "bg-[var(--status-manual)]" : "bg-[var(--status-pending)]"
                )} />
                <span className="text-xs text-muted-foreground">{lead.status === "manual" ? "Review" : (lead.status ?? "pending").charAt(0).toUpperCase() + (lead.status ?? "pending").slice(1)}</span>
              </div>
              <p className="text-xs text-muted-foreground truncate mt-0.5">{lead.workType ?? "N/A"} · {lead.location ?? "N/A"}</p>
            </div>

            <div className="hidden md:flex items-center gap-3 text-xs text-muted-foreground">
              <span>{lead.phone}</span>
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-muted text-muted-foreground">
                {lead.source === "whatsapp" ? (
                  <svg className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                ) : (
                  <Mail className="h-3 w-3" />
                )}
                {lead.source === "whatsapp" ? "WhatsApp" : "Email"}
              </span>
            </div>

            {(() => {
              const rec = getAiRec(lead)
              return (
                <span className="flex items-center gap-1 text-xs px-2 py-1 rounded-md bg-muted text-muted-foreground font-medium">
                  <Sparkles className="h-3 w-3" />
                  {rec.text}
                </span>
              )
            })()}
          </button>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {displayLeads.map((lead) => (
        <LeadCard
          key={lead.id}
          lead={lead}
          onClick={() => onSelectLead(lead)}
          isSelected={selectedLeadId === lead.id}
        />
      ))}
    </div>
  )
}
