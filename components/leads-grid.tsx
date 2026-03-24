"use client"

import { LeadCard } from "./lead-card"
import type { Lead, LeadStatus } from "@/lib/types"

interface LeadsGridProps {
  leads: Lead[]
  searchQuery: string
  statusFilter: LeadStatus | null
  selectedLeadId: string | null
  onSelectLead: (lead: Lead) => void
}

export function LeadsGrid({
  leads,
  searchQuery,
  statusFilter,
  selectedLeadId,
  onSelectLead,
}: LeadsGridProps) {
  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      !searchQuery ||
      lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.phone.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.workType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.conversationSummary.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = !statusFilter || lead.status === statusFilter

    return matchesSearch && matchesStatus
  })

  if (filteredLeads.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/50 py-16">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
          <svg
            className="h-8 w-8 text-muted-foreground"
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
        <h3 className="mt-4 text-lg font-medium text-foreground">No leads found</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          {searchQuery || statusFilter
            ? "Try adjusting your search or filters"
            : "New leads from WhatsApp will appear here"}
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {filteredLeads.map((lead) => (
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
