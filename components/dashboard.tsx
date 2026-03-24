"use client"

import { useState, useCallback } from "react"
import useSWR from "swr"
import { AppSidebar } from "./app-sidebar"
import { AppHeader } from "./app-header"
import { StatsCards } from "./stats-cards"
import { LeadsGrid } from "./leads-grid"
import { LeadDetailPanel } from "./lead-detail-panel"
import type { Lead, LeadStatus } from "@/lib/types"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function Dashboard() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<LeadStatus | null>(null)
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)

  const { data: leads = [], mutate, isValidating } = useSWR<Lead[]>(
    "/api/leads",
    fetcher,
    {
      refreshInterval: 30000, // Auto-refresh every 30 seconds
    }
  )

  const handleRefresh = useCallback(() => {
    mutate()
  }, [mutate])

  const handleFilterChange = (filter: LeadStatus | null) => {
    setStatusFilter(filter)
  }

  const handleSelectLead = (lead: Lead) => {
    setSelectedLead(lead)
  }

  const handleCloseLead = () => {
    setSelectedLead(null)
  }

  const handleUpdateLead = async (updates: Partial<Lead>) => {
    if (!selectedLead) return

    const response = await fetch(`/api/leads/${selectedLead.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    })

    if (response.ok) {
      const updatedLead = await response.json()
      setSelectedLead(updatedLead)
      mutate()
    }
  }

  const handleSendMessage = async (action: "approve" | "decline", message: string) => {
    if (!selectedLead) return

    const response = await fetch(`/api/leads/${selectedLead.id}/send`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, message }),
    })

    if (response.ok) {
      const result = await response.json()
      setSelectedLead(result.lead)
      mutate()
    }
  }

  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar activeFilter={statusFilter} onFilterChange={handleFilterChange} />

      <div className="flex-1 pl-64">
        <AppHeader
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onRefresh={handleRefresh}
          isRefreshing={isValidating}
        />

        <main className="p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-foreground">WhatsApp Leads</h1>
            <p className="mt-1 text-muted-foreground">
              Review and respond to incoming customer inquiries
            </p>
          </div>

          <StatsCards leads={leads} />

          <div className="mt-8">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">
                {statusFilter ? `${statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)} Leads` : "All Leads"}
              </h2>
              <span className="text-sm text-muted-foreground">
                {leads.length} total leads
              </span>
            </div>

            <LeadsGrid
              leads={leads}
              searchQuery={searchQuery}
              statusFilter={statusFilter}
              selectedLeadId={selectedLead?.id ?? null}
              onSelectLead={handleSelectLead}
            />
          </div>
        </main>
      </div>

      {selectedLead && (
        <LeadDetailPanel
          lead={selectedLead}
          onClose={handleCloseLead}
          onUpdate={handleUpdateLead}
          onSendMessage={handleSendMessage}
        />
      )}
    </div>
  )
}
