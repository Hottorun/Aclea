export type LeadStatus = "new" | "contacted" | "qualified" | "converted" | "lost"

export type LeadTag = "hot" | "warm" | "cold" | "vip" | "follow-up" | "urgent"

export interface Lead {
  id: string
  name: string
  phone: string
  message: string
  source: string
  status: LeadStatus
  tags: LeadTag[]
  assignedTo: string | null
  notes: string[]
  createdAt: string
  updatedAt: string
}

export interface LeadStats {
  total: number
  new: number
  converted: number
  conversionRate: number
}
