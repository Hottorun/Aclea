import { createClient, SupabaseClient } from "@supabase/supabase-js"
import type { Lead, AppSettings, LeadStatus } from "./types"
import { mockLeads } from "./mock-data"

let supabase: SupabaseClient | null = null

function getSupabase(): SupabaseClient | null {
  if (supabase) return supabase
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  // Use service role key for server-side operations (bypasses RLS)
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!supabaseUrl || !supabaseKey) {
    return null
  }
  
  supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })
  
  return supabase
}

let inMemoryLeads = [...mockLeads]

let inMemorySettings: AppSettings = {
  autoDeleteDeclinedDays: 0,
  webhookUrl: process.env.N8N_WEBHOOK_URL || process.env.CHATBOT_WEBHOOK_URL || "",
  autoApproveEnabled: false,
  autoApproveMinRating: 4,
  autoDeclineUnrelated: false,
  followUpDays: 3,
  followUpMessage: "Hi {name}, just checking in on your inquiry. Are you still interested?",
  defaultApproveMessage: "Thank you for your interest! We'd love to work with you.",
  defaultDeclineMessage: "Thank you for reaching out. Unfortunately, we're not able to help at this time.",
  defaultUnrelatedMessage: "This message doesn't seem to be related to our services.",
}

export async function getLeads(): Promise<Lead[]> {
  const client = getSupabase()
  
  if (!client) {
    return inMemoryLeads.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  }

  const { data, error } = await client
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching leads:", error)
    return []
  }

  return (data || []).map(mapDbLeadToLead)
}

export async function getLeadById(id: string): Promise<Lead | null> {
  const client = getSupabase()
  
  if (!client) {
    return inMemoryLeads.find((lead) => lead.id === id) || null
  }

  const { data, error } = await client
    .from("leads")
    .select("*")
    .eq("id", id)
    .single()

  if (error) {
    console.error("Error fetching lead:", error)
    return null
  }

  return mapDbLeadToLead(data)
}

export async function addLead(lead: {
  name: string
  phone: string
  email: string
  location: string
  workType: string
  conversationSummary: string
  approveMessage: string
  declineMessage: string
  rating: number
  ratingReason: string
  contactPlatform?: "whatsapp" | "email"
  status?: LeadStatus
  leadCount?: number
  isLoyal?: boolean
  autoApproved?: boolean
  originalMessage?: string
}): Promise<Lead | null> {
  const client = getSupabase()
  
  const existingLeads = await getLeads()
  const leadCount = existingLeads.filter(l => l.phone === lead.phone).length + 1
  const isLoyal = leadCount >= 3

  if (!client) {
    const newLead: Lead = {
      id: `lead-${Date.now()}`,
      name: lead.name,
      phone: lead.phone,
      email: lead.email,
      location: lead.location,
      workType: lead.workType,
      conversationSummary: lead.conversationSummary,
      approveMessage: lead.approveMessage,
      declineMessage: lead.declineMessage,
      rating: lead.rating,
      ratingReason: lead.ratingReason,
      contactPlatform: lead.contactPlatform || "whatsapp",
      status: lead.status || "pending",
      leadCount,
      isLoyal,
      autoApproved: lead.autoApproved || false,
      originalMessage: lead.originalMessage || "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    inMemoryLeads.unshift(newLead)
    return newLead
  }

  const { data, error } = await client
    .from("leads")
    .insert({
      name: lead.name,
      phone: lead.phone,
      email: lead.email,
      location: lead.location,
      work_type: lead.workType,
      conversation_summary: lead.conversationSummary,
      approve_message: lead.approveMessage,
      decline_message: lead.declineMessage,
      rating: lead.rating,
      rating_reason: lead.ratingReason,
      contact_platform: lead.contactPlatform || "whatsapp",
      lead_count: leadCount,
      is_loyal: isLoyal,
      status: lead.status || "pending",
      auto_approved: lead.autoApproved || false,
      original_message: lead.originalMessage || "",
    })
    .select()
    .single()

  if (error) {
    console.error("Error adding lead:", error)
    return null
  }

  return mapDbLeadToLead(data)
}

export async function updateLead(id: string, updates: Partial<Lead>): Promise<Lead | null> {
  const client = getSupabase()
  
  if (!client) {
    const index = inMemoryLeads.findIndex((lead) => lead.id === id)
    if (index === -1) return null
    
    inMemoryLeads[index] = {
      ...inMemoryLeads[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    }
    return inMemoryLeads[index]
  }

  const dbUpdates: Record<string, unknown> = {}
  
  if (updates.name !== undefined) dbUpdates.name = updates.name
  if (updates.phone !== undefined) dbUpdates.phone = updates.phone
  if (updates.email !== undefined) dbUpdates.email = updates.email
  if (updates.location !== undefined) dbUpdates.location = updates.location
  if (updates.workType !== undefined) dbUpdates.work_type = updates.workType
  if (updates.conversationSummary !== undefined) dbUpdates.conversation_summary = updates.conversationSummary
  if (updates.approveMessage !== undefined) dbUpdates.approve_message = updates.approveMessage
  if (updates.declineMessage !== undefined) dbUpdates.decline_message = updates.declineMessage
  if (updates.rating !== undefined) dbUpdates.rating = updates.rating
  if (updates.ratingReason !== undefined) dbUpdates.rating_reason = updates.ratingReason
  if (updates.status !== undefined) dbUpdates.status = updates.status
  if (updates.contactPlatform !== undefined) dbUpdates.contact_platform = updates.contactPlatform
  if (updates.leadCount !== undefined) dbUpdates.lead_count = updates.leadCount
  if (updates.isLoyal !== undefined) dbUpdates.is_loyal = updates.isLoyal
  if (updates.autoApproved !== undefined) dbUpdates.auto_approved = updates.autoApproved
  if (updates.originalMessage !== undefined) dbUpdates.original_message = updates.originalMessage
  if (updates.lastContactedAt !== undefined) dbUpdates.last_contacted_at = updates.lastContactedAt

  const { data, error } = await client
    .from("leads")
    .update(dbUpdates)
    .eq("id", id)
    .select()
    .single()

  if (error) {
    console.error("Error updating lead:", error)
    return null
  }

  return mapDbLeadToLead(data)
}

export async function deleteLead(id: string): Promise<boolean> {
  const client = getSupabase()
  
  if (!client) {
    const index = inMemoryLeads.findIndex((lead) => lead.id === id)
    if (index === -1) return false
    inMemoryLeads.splice(index, 1)
    return true
  }

  const { error } = await client
    .from("leads")
    .delete()
    .eq("id", id)

  if (error) {
    console.error("Error deleting lead:", error)
    return false
  }

  return true
}

export async function deleteAllLeads(): Promise<boolean> {
  const client = getSupabase()
  
  if (!client) {
    inMemoryLeads = []
    return true
  }

  const { error } = await client
    .from("leads")
    .delete()
    .neq("id", "")

  if (error) {
    console.error("Error deleting all leads:", error)
    return false
  }

  return true
}

export async function deleteDeclinedLeadsOlderThan(days: number): Promise<number> {
  const client = getSupabase()
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - days)

  if (!client) {
    const initialLength = inMemoryLeads.length
    inMemoryLeads = inMemoryLeads.filter(
      (lead) => !(lead.status === "declined" && new Date(lead.updatedAt) < cutoffDate)
    )
    return initialLength - inMemoryLeads.length
  }

  const { data, error } = await client
    .from("leads")
    .delete()
    .eq("status", "declined")
    .lt("updated_at", cutoffDate.toISOString())
    .select()

  if (error) {
    console.error("Error deleting old declined leads:", error)
    return 0
  }

  return data?.length || 0
}

export async function getSettings(): Promise<AppSettings> {
  const client = getSupabase()
  
  if (!client) {
    return inMemorySettings
  }

  const { data, error } = await client
    .from("settings")
    .select("*")
    .single()

  if (error || !data) {
    return inMemorySettings
  }

  return {
    autoDeleteDeclinedDays: data.auto_delete_declined_days || 0,
    webhookUrl: data.webhook_url || "",
    autoApproveEnabled: data.auto_approve_enabled || false,
    autoApproveMinRating: data.auto_approve_min_rating || 4,
    autoDeclineUnrelated: data.auto_decline_unrelated || false,
    followUpDays: data.follow_up_days || 3,
    followUpMessage: data.follow_up_message || "Hi {name}, just checking in on your inquiry. Are you still interested?",
    defaultApproveMessage: data.default_approve_message || "Thank you for your interest! We'd love to work with you.",
    defaultDeclineMessage: data.default_decline_message || "Thank you for reaching out. Unfortunately, we're not able to help at this time.",
    defaultUnrelatedMessage: data.default_unrelated_message || "This message doesn't seem to be related to our services.",
  }
}

export async function updateSettings(settings: Partial<AppSettings>): Promise<AppSettings> {
  const client = getSupabase()
  
  if (!client) {
    inMemorySettings = { ...inMemorySettings, ...settings }
    return inMemorySettings
  }

  const { data, error } = await client
    .from("settings")
    .upsert({
      id: 1,
      auto_delete_declined_days: settings.autoDeleteDeclinedDays,
      webhook_url: settings.webhookUrl,
      auto_approve_enabled: settings.autoApproveEnabled,
      auto_approve_min_rating: settings.autoApproveMinRating,
      auto_decline_unrelated: settings.autoDeclineUnrelated,
      follow_up_days: settings.followUpDays,
      follow_up_message: settings.followUpMessage,
      default_approve_message: settings.defaultApproveMessage,
      default_decline_message: settings.defaultDeclineMessage,
      default_unrelated_message: settings.defaultUnrelatedMessage,
    })
    .select()
    .single()

  if (error) {
    console.error("Error updating settings:", error)
    return inMemorySettings
  }

  return {
    autoDeleteDeclinedDays: data.auto_delete_declined_days || 0,
    webhookUrl: data.webhook_url || "",
    autoApproveEnabled: data.auto_approve_enabled || false,
    autoApproveMinRating: data.auto_approve_min_rating || 4,
    autoDeclineUnrelated: data.auto_decline_unrelated || false,
    followUpDays: data.follow_up_days || 3,
    followUpMessage: data.follow_up_message || "Hi {name}, just checking in on your inquiry. Are you still interested?",
    defaultApproveMessage: data.default_approve_message || "Thank you for your interest! We'd love to work with you.",
    defaultDeclineMessage: data.default_decline_message || "Thank you for reaching out. Unfortunately, we're not able to help at this time.",
    defaultUnrelatedMessage: data.default_unrelated_message || "This message doesn't seem to be related to our services.",
  }
}

function mapDbLeadToLead(row: {
  id: string
  name: string
  phone: string
  email: string
  location: string
  work_type: string
  conversation_summary: string
  approve_message: string
  decline_message: string
  rating: number
  rating_reason: string
  status: string
  contact_platform?: string
  lead_count?: number
  is_loyal?: boolean
  auto_approved?: boolean
  original_message?: string
  last_contacted_at?: string
  created_at: string
  updated_at: string
}): Lead {
  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
    email: row.email,
    location: row.location,
    workType: row.work_type,
    conversationSummary: row.conversation_summary,
    approveMessage: row.approve_message,
    declineMessage: row.decline_message,
    rating: row.rating,
    ratingReason: row.rating_reason,
    status: row.status as Lead["status"],
    contactPlatform: (row.contact_platform as Lead["contactPlatform"]) || "whatsapp",
    leadCount: row.lead_count || 1,
    isLoyal: row.is_loyal || false,
    autoApproved: row.auto_approved || false,
    originalMessage: row.original_message || "",
    lastContactedAt: row.last_contacted_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}
