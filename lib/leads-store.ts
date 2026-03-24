import type { Lead, IncomingLead } from "./types"
import { mockLeads } from "./mock-data"

// In-memory store for demo purposes
// In production, replace with database calls
let leads: Lead[] = [...mockLeads]

export function getLeads(): Lead[] {
  return leads.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

export function getLeadById(id: string): Lead | undefined {
  return leads.find((lead) => lead.id === id)
}

export function addLead(incomingLead: IncomingLead): Lead {
  const newLead: Lead = {
    id: `lead-${Date.now()}`,
    name: incomingLead.name,
    phone: incomingLead.phone,
    email: incomingLead.email,
    location: incomingLead.location,
    workType: incomingLead.workType,
    conversationSummary: incomingLead.conversationSummary,
    approveMessage: incomingLead.approveMessage,
    declineMessage: incomingLead.declineMessage,
    status: "pending",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  leads.unshift(newLead)
  return newLead
}

export function updateLead(id: string, updates: Partial<Lead>): Lead | null {
  const index = leads.findIndex((lead) => lead.id === id)
  if (index === -1) return null

  leads[index] = {
    ...leads[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  }
  return leads[index]
}

export function deleteLead(id: string): boolean {
  const index = leads.findIndex((lead) => lead.id === id)
  if (index === -1) return false
  leads.splice(index, 1)
  return true
}
