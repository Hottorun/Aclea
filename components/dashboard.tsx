"use client"

import { useState, useCallback } from "react"
import useSWR from "swr"
import { AppSidebar } from "./app-sidebar"
import { AppHeader } from "./app-header"
import { StatsCards } from "./stats-cards"
import { LeadsGrid } from "./leads-grid"
import { LeadDetailPanel } from "./lead-detail-panel"
import type { Lead, LeadTag } from "@/lib/types"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function Dashboard() {
  const [searchQuery, setSearchQuery] = useState("")
  const [tagFilter, setTagFilter] = useState<LeadTag | null>(null)
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

  const handleFilterChange = (filter: string | null) => {
    setTagFilter(filter as LeadTag | null)
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

  const handleDeleteLead = async () => {
    if (!selectedLead) return

    const response = await fetch(`/api/leads/${selectedLead.id}`, {
      method: "DELETE",
    })

    if (response.ok) {
      setSelectedLead(null)
      mutate()
    }
  }

  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar activeFilter={tagFilter} onFilterChange={handleFilterChange} />

      <div className="flex-1 pl-64">
        <AppHeader
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onRefresh={handleRefresh}
          isRefreshing={isValidating}
        />

        <main className="p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
            <p className="mt-1 text-muted-foreground">
              Monitor and manage your WhatsApp leads
            </p>
          </div>

          <StatsCards leads={leads} />

          <div className="mt-8">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">
                Recent Leads
                {tagFilter && (
                  <span className="ml-2 text-sm font-normal text-muted-foreground">
                    (Filtered by: {tagFilter})
                  </span>
                )}
              </h2>
              <span className="text-sm text-muted-foreground">
                {leads.length} total leads
              </span>
            </div>

            <LeadsGrid
              leads={leads}
              searchQuery={searchQuery}
              tagFilter={tagFilter}
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
          onDelete={handleDeleteLead}
        />
      )}
    </div>
  )
}
