"use client"

import { useState, useRef, useCallback, useEffect, useMemo } from "react"
import useSWR from "swr"
import { cn } from "@/lib/utils"
import { format, startOfWeek, addDays, isSameDay } from "date-fns"
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Clock,
  Phone,
  Mail,
  X,
  Check,
  Settings2,
  Save,
  Loader2,
} from "lucide-react"
import type { Lead } from "@/lib/types"
import type { User } from "@/lib/use-user"

// ─── Types ────────────────────────────────────────────────────────────────────

interface Appointment {
  id: string
  leadId: string
  leadName: string
  leadEmail: string
  leadPhone: string
  type: "call" | "follow-up" | "consultation"
  day: number   // 0–6 (Mon–Sun)
  hour: number  // 0–23
  duration: number
}

interface DayHours {
  enabled: boolean
  start: number
  end: number
}

type WorkingHours = Record<number, DayHours>

interface ScheduleMember {
  id: string
  name: string
  role: string
  isMe: boolean
}

interface CalendarViewProps {
  leads: Lead[]
  onUnsavedChange?: (hasChanges: boolean) => void
  saveRef?: React.MutableRefObject<() => Promise<void>>
}

// ─── Constants ────────────────────────────────────────────────────────────────

const DAYS       = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
const HOUR_OPTIONS = Array.from({ length: 24 }, (_, i) => i)

const DEFAULT_WORKING_HOURS: WorkingHours = {
  0: { enabled: true,  start: 8, end: 17 },
  1: { enabled: true,  start: 8, end: 17 },
  2: { enabled: true,  start: 8, end: 17 },
  3: { enabled: true,  start: 8, end: 17 },
  4: { enabled: true,  start: 8, end: 17 },
  5: { enabled: false, start: 9, end: 13 },
  6: { enabled: false, start: 9, end: 13 },
}

const TIMEZONES = [
  { label: "UTC",                   value: "UTC" },
  { label: "Eastern (ET)",          value: "America/New_York" },
  { label: "Central (CT)",          value: "America/Chicago" },
  { label: "Mountain (MT)",         value: "America/Denver" },
  { label: "Pacific (PT)",          value: "America/Los_Angeles" },
  { label: "London (GMT/BST)",      value: "Europe/London" },
  { label: "Paris / Berlin (CET)",  value: "Europe/Paris" },
  { label: "Dubai (GST)",           value: "Asia/Dubai" },
  { label: "Mumbai (IST)",          value: "Asia/Kolkata" },
  { label: "Singapore / HKG",       value: "Asia/Singapore" },
  { label: "Tokyo (JST)",           value: "Asia/Tokyo" },
  { label: "Sydney (AEST)",         value: "Australia/Sydney" },
  { label: "São Paulo (BRT)",       value: "America/Sao_Paulo" },
]

const TYPE_CONFIG = {
  call:         { color: "bg-blue-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400",    dot: "bg-blue-500",    label: "Call" },
  "follow-up":  { color: "bg-violet-500/10 border-violet-500/20 text-violet-600 dark:text-violet-400", dot: "bg-violet-500", label: "Follow-up" },
  consultation: { color: "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400", dot: "bg-emerald-500", label: "Consult" },
} as const

const ROLE_BADGE: Record<string, string> = {
  owner:  "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  admin:  "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  member: "bg-muted text-muted-foreground",
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatHour(h: number) {
  if (h === 0)  return "12 AM"
  if (h === 12) return "12 PM"
  return h < 12 ? `${h} AM` : `${h - 12} PM`
}

function generateId() {
  return Math.random().toString(36).slice(2, 10)
}

function getLocalTimezone() {
  try {
    const tz     = Intl.DateTimeFormat().resolvedOptions().timeZone
    const offset = -new Date().getTimezoneOffset()
    const sign   = offset >= 0 ? "+" : "-"
    const h      = Math.floor(Math.abs(offset) / 60).toString().padStart(2, "0")
    const m      = (Math.abs(offset) % 60).toString().padStart(2, "0")
    return `${tz.replace(/_/g, " ")} (UTC${sign}${h}:${m})`
  } catch {
    return "UTC"
  }
}

function storageKey(memberId: string) {
  return `aclea_calendar_${memberId}`
}

function loadMemberDataLocal(memberId: string): { appointments: Appointment[]; workingHours: WorkingHours } | null {
  if (typeof window === "undefined") return null
  try {
    const raw = localStorage.getItem(storageKey(memberId))
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return {
      appointments: Array.isArray(parsed.appointments) ? parsed.appointments : [],
      workingHours: parsed.workingHours ?? DEFAULT_WORKING_HOURS,
    }
  } catch {
    return null
  }
}

function saveMemberDataLocal(memberId: string, appointments: Appointment[], workingHours: WorkingHours) {
  if (typeof window === "undefined") return
  localStorage.setItem(storageKey(memberId), JSON.stringify({ appointments, workingHours }))
}

async function loadMemberDataRemote(memberId: string): Promise<{ appointments: Appointment[]; workingHours: WorkingHours } | null> {
  try {
    const res = await fetch(`/api/calendar?memberId=${encodeURIComponent(memberId)}`)
    if (!res.ok) return null
    const data = await res.json()
    const appointments = Array.isArray(data.appointments) ? data.appointments : []
    const workingHours = data.workingHours && Object.keys(data.workingHours).length > 0
      ? data.workingHours
      : null
    return { appointments, workingHours: workingHours ?? DEFAULT_WORKING_HOURS }
  } catch {
    return null
  }
}

async function saveMemberDataRemote(memberId: string, appointments: Appointment[], workingHours: WorkingHours) {
  try {
    await fetch("/api/calendar", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ memberId, appointments, workingHours }),
    })
  } catch {
    // silent — localStorage already has the data
  }
}

function appointmentsHash(appts: Appointment[]) {
  return JSON.stringify(
    [...appts]
      .sort((a, b) => a.id.localeCompare(b.id))
      .map(a => ({ id: a.id, day: a.day, hour: a.hour, type: a.type }))
  )
}

const fetcher = (url: string) => fetch(url).then(r => r.json())

// ─── Main Component ───────────────────────────────────────────────────────────

export function CalendarView({ leads, onUnsavedChange, saveRef }: CalendarViewProps) {
  const [selectedMemberId, setSelectedMemberId] = useState<string>("")
  const [weekOffset, setWeekOffset]         = useState(0)
  const [timezone, setTimezone]             = useState("UTC")
  const [appointments, setAppointments]     = useState<Appointment[]>([])
  const [workingHours, setWorkingHours]     = useState<WorkingHours>(DEFAULT_WORKING_HOURS)
  const [showHoursPanel, setShowHoursPanel] = useState(false)
  const [dragging, setDragging]             = useState<string | null>(null)
  const [dragOver, setDragOver]             = useState<{ day: number; hour: number } | null>(null)
  const [toast, setToast]                   = useState<{ text: string; ok?: boolean } | null>(null)
  const [showTzDropdown, setShowTzDropdown] = useState(false)
  const [isSaving, setIsSaving]             = useState(false)
  const [schedulePicker, setSchedulePicker] = useState<{ lead: Lead; day: number; hour: number } | null>(null)
  const [showClearConfirm, setShowClearConfirm] = useState(false)

  const savedHashRef = useRef<string>("")
  const tzRef        = useRef<HTMLDivElement>(null)
  const scrollRef   = useRef<HTMLDivElement>(null)
  const resizingRef = useRef<{ id: string; startY: number; originalDuration: number } | null>(null)
  const localTz     = getLocalTimezone()

  // ── Dynamic hour range: only show rows between min-start and max-end ──
  const { minHour, maxHour } = useMemo(() => {
    const enabled = Object.values(workingHours).filter(d => d.enabled)
    if (enabled.length === 0) return { minHour: 8, maxHour: 17 }
    return {
      minHour: Math.min(...enabled.map(d => d.start)),
      maxHour: Math.max(...enabled.map(d => d.end)),
    }
  }, [workingHours])

  const visibleHours = useMemo(
    () => Array.from({ length: maxHour - minHour }, (_, i) => minHour + i),
    [minHour, maxHour]
  )

  // ── Unsaved state ──
  const hasUnsaved = useMemo(() => {
    if (appointments.length === 0) return false
    return appointmentsHash(appointments) !== savedHashRef.current
  }, [appointments])

  // Team members
  const { data: membersData } = useSWR("/api/teams/members", fetcher, {
    onError: () => {},
    revalidateOnFocus: false,
  })
  const rawMembers: { id: string; name: string; role: string }[] = membersData?.members ?? []

  const scheduleMembers: ScheduleMember[] = useMemo(() => [
    { id: "me", name: "You", role: "member", isMe: true },
    ...rawMembers
      .filter(m => m.id !== "me")
      .map(m => ({ id: m.id, name: m.name, role: m.role, isMe: false })),
  ], [rawMembers])

  const selectedMember = scheduleMembers.find(m => m.id === selectedMemberId) ?? scheduleMembers[0]

  useEffect(() => { onUnsavedChange?.(hasUnsaved) }, [hasUnsaved, onUnsavedChange])

  // ── Load member data when selection changes (local first, then remote) ──
  useEffect(() => {
    const id = selectedMemberId || "me"
    // Immediately apply local data so UI isn't blank
    const local = loadMemberDataLocal(id)
    if (local) {
      setAppointments(local.appointments)
      setWorkingHours(local.workingHours)
    } else {
      setAppointments([])
      setWorkingHours(DEFAULT_WORKING_HOURS)
    }
    // Then fetch from Supabase and override if we got real data
    loadMemberDataRemote(id).then(remote => {
      if (!remote) return
      setAppointments(remote.appointments)
      setWorkingHours(remote.workingHours)
      saveMemberDataLocal(id, remote.appointments, remote.workingHours)
    })
  }, [selectedMemberId])

  // ── Persist with debounce (local + remote) ──
  useEffect(() => {
    const id = selectedMemberId || "me"
    const timer = setTimeout(() => {
      saveMemberDataLocal(id, appointments, workingHours)
      saveMemberDataRemote(id, appointments, workingHours)
    }, 500)
    return () => clearTimeout(timer)
  }, [appointments, workingHours, selectedMemberId])

  // ── Beforeunload warning ──
  useEffect(() => {
    if (!hasUnsaved) return
    const handler = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = "" }
    window.addEventListener("beforeunload", handler)
    return () => window.removeEventListener("beforeunload", handler)
  }, [hasUnsaved])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (tzRef.current && !tzRef.current.contains(e.target as Node)) setShowTzDropdown(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 3500)
    return () => clearTimeout(t)
  }, [toast])

  // Resize mouse handlers
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const r = resizingRef.current
      if (!r) return
      const deltaSlots = Math.round((e.clientY - r.startY) / 52)
      const newDuration = Math.max(1, r.originalDuration + deltaSlots)
      setAppointments(prev => prev.map(a => a.id === r.id ? { ...a, duration: newDuration } : a))
    }
    const onUp = () => { resizingRef.current = null }
    document.addEventListener("mousemove", onMove)
    document.addEventListener("mouseup", onUp)
    return () => {
      document.removeEventListener("mousemove", onMove)
      document.removeEventListener("mouseup", onUp)
    }
  }, [])

  const weekStart      = addDays(startOfWeek(new Date(), { weekStartsOn: 1 }), weekOffset * 7)
  const weekDays       = DAYS.map((_, i) => addDays(weekStart, i))
  const today          = new Date()

  // ── Current time indicator ──
  const [nowMinutes, setNowMinutes] = useState(() => {
    const n = new Date()
    return n.getHours() * 60 + n.getMinutes()
  })
  useEffect(() => {
    const id = setInterval(() => {
      const n = new Date()
      setNowMinutes(n.getHours() * 60 + n.getMinutes())
    }, 60_000)
    return () => clearInterval(id)
  }, [])

  // ── Helpers ──
  const isWithinWorkingHours = useCallback((day: number, hour: number) => {
    const dh = workingHours[day]
    return !!(dh?.enabled && hour >= dh.start && hour < dh.end)
  }, [workingHours])

  const firstAvailableSlot = useCallback((): { day: number; hour: number } => {
    for (let day = 0; day < 7; day++) {
      const dh = workingHours[day]
      if (!dh?.enabled) continue
      const taken = new Set(appointments.filter(a => a.day === day).map(a => a.hour))
      for (let hour = dh.start; hour < dh.end; hour++) {
        if (!taken.has(hour)) return { day, hour }
      }
    }
    for (let day = 0; day < 7; day++) {
      if (workingHours[day]?.enabled) return { day, hour: workingHours[day].start }
    }
    return { day: 0, hour: 9 }
  }, [workingHours, appointments])

  // ── Save ──
  const handleSave = useCallback(async () => {
    if (appointments.length === 0) return
    setIsSaving(true)
    try {
      const res = await fetch("/api/appointments/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appointments: appointments.map(a => ({
            leadId: a.leadId, leadName: a.leadName, leadEmail: a.leadEmail,
            leadPhone: a.leadPhone, day: a.day, hour: a.hour, type: a.type,
          })),
        }),
      })
      if (!res.ok) throw new Error()
      savedHashRef.current = appointmentsHash(appointments)
      setToast({ text: "Saved & notifications sent", ok: true })
    } catch {
      setToast({ text: "Failed to save — try again", ok: false })
    } finally {
      setIsSaving(false)
    }
  }, [appointments])

  useEffect(() => { if (saveRef) saveRef.current = handleSave }, [saveRef, handleSave])

  // ── Drag ──
  const handleDragStart = useCallback((e: React.DragEvent, id: string) => {
    setDragging(id)
    e.dataTransfer.effectAllowed = "move"
    e.dataTransfer.setData("text/plain", id)
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent, day: number, hour: number) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
    setDragOver({ day, hour })
  }, [])

  const handleDrop = useCallback((e: React.DragEvent, day: number, hour: number) => {
    e.preventDefault()
    const id = e.dataTransfer.getData("text/plain")
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, day, hour } : a))
    setDragging(null)
    setDragOver(null)
    setToast(isWithinWorkingHours(day, hour)
      ? { text: "Rescheduled" }
      : { text: "Moved outside working hours", ok: false }
    )
  }, [isWithinWorkingHours])

  const handleDragEnd = useCallback(() => { setDragging(null); setDragOver(null) }, [])

  const handleResizeStart = useCallback((id: string, startY: number, originalDuration: number) => {
    resizingRef.current = { id, startY, originalDuration }
  }, [])

  // ── Auto-schedule ──
  const autoSchedule = useCallback(() => {
    const eligible = leads.filter(l => {
      const status = l.session?.status || l.status
      return status === "approved" || (l.session?.rating ?? l.rating ?? 0) >= 4
    }).slice(0, 20)

    if (eligible.length === 0) { setToast({ text: "No approved leads to schedule" }); return }

    const slots: { day: number; hour: number }[] = []
    for (let day = 0; day < 7; day++) {
      const dh = workingHours[day]
      if (!dh?.enabled) continue
      for (let hour = dh.start; hour < dh.end; hour++) slots.push({ day, hour })
    }

    if (slots.length === 0) { setToast({ text: "Enable working hours first" }); return }

    const types: Appointment["type"][] = ["call", "follow-up", "consultation"]
    const newAppts: Appointment[] = []
    let slotIdx = 0

    for (const lead of eligible) {
      if (appointments.some(a => a.leadId === lead.id)) continue
      if (slotIdx >= slots.length) break
      const slot = slots[slotIdx]; slotIdx += 2
      newAppts.push({
        id: generateId(), leadId: lead.id, leadName: lead.name,
        leadEmail: lead.email, leadPhone: lead.phone,
        type: types[newAppts.length % types.length],
        day: slot.day, hour: slot.hour, duration: 1,
      })
    }

    if (newAppts.length === 0) { setToast({ text: "All leads already scheduled" }); return }
    setAppointments(prev => [...prev, ...newAppts])
    setToast({ text: `${newAppts.length} appointment${newAppts.length > 1 ? "s" : ""} scheduled` })
  }, [leads, appointments, workingHours])

  const removeAppointment = useCallback((id: string) => {
    setAppointments(prev => prev.filter(a => a.id !== id))
  }, [])

  // ── Working hours helpers ──
  const toggleDay    = (i: number) => setWorkingHours(p => ({ ...p, [i]: { ...p[i], enabled: !p[i].enabled } }))
  const updateStart  = (i: number, start: number) => setWorkingHours(p => ({ ...p, [i]: { ...p[i], start, end: Math.max(p[i].end, start + 1) } }))
  const updateEnd    = (i: number, end: number)   => setWorkingHours(p => ({ ...p, [i]: { ...p[i], end, start: Math.min(p[i].start, end - 1) } }))

  const clearSchedule = () => {
    setAppointments([])
    setShowClearConfirm(false)
    setToast({ text: "Schedule cleared", ok: true })
  }

  const selectedTz = TIMEZONES.find(t => t.value === timezone) ?? TIMEZONES[0]
  const isThisWeek = weekOffset === 0

  // ── Current time position ──
  const nowInRange    = isThisWeek && nowMinutes >= minHour * 60 && nowMinutes < maxHour * 60
  const nowTopPercent = nowInRange ? ((nowMinutes - minHour * 60) / ((maxHour - minHour) * 60)) * 100 : -1
  const todayColIdx   = isThisWeek ? ((today.getDay() + 6) % 7) : -1 // Mon=0

  return (
    <div className="p-6 space-y-4 max-w-7xl mx-auto">

      {/* ── Header row ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Calendar</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {appointments.length} appointment{appointments.length !== 1 ? "s" : ""} this week
            {hasUnsaved && <span className="ml-2 text-amber-500 font-medium">· unsaved changes</span>}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Working hours */}
          <button
            onClick={() => setShowHoursPanel(v => !v)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-xs font-medium transition-colors",
              showHoursPanel ? "bg-foreground text-background border-foreground" : "border-border bg-card hover:bg-muted"
            )}
          >
            <Settings2 className="h-3 w-3" />
            Hours
          </button>

          {/* Timezone */}
          <div className="relative" ref={tzRef}>
            <button
              onClick={() => setShowTzDropdown(v => !v)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border bg-card text-xs font-medium hover:bg-muted transition-colors"
            >
              <Clock className="h-3 w-3 text-muted-foreground" />
              {selectedTz.label}
            </button>
            {showTzDropdown && (
              <div className="absolute right-0 mt-1 w-56 bg-card border border-border rounded-lg shadow-xl z-50 overflow-hidden">
                <div className="max-h-56 overflow-y-auto py-1">
                  {TIMEZONES.map(tz => (
                    <button key={tz.value}
                      onClick={() => { setTimezone(tz.value); setShowTzDropdown(false) }}
                      className={cn(
                        "w-full text-left px-3 py-1.5 text-xs transition-colors flex items-center gap-2",
                        tz.value === timezone ? "bg-muted text-foreground font-medium" : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                      )}
                    >
                      {tz.value === timezone && <Check className="h-3 w-3 shrink-0" />}
                      <span className={tz.value === timezone ? "" : "pl-[18px]"}>{tz.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Week nav */}
          <div className="flex items-center gap-1 border border-border rounded-md bg-card">
            <button onClick={() => setWeekOffset(o => o - 1)} className="p-1.5 hover:bg-muted rounded-l-md transition-colors text-muted-foreground hover:text-foreground">
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            <span className="px-2 text-xs font-medium whitespace-nowrap">
              {format(weekStart, "MMM d")} – {format(addDays(weekStart, 6), "d")}
              {isThisWeek && <span className="ml-1 text-muted-foreground">· now</span>}
            </span>
            <button onClick={() => setWeekOffset(o => o + 1)} className="p-1.5 hover:bg-muted rounded-r-md transition-colors text-muted-foreground hover:text-foreground">
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* AI Schedule */}
          <button onClick={autoSchedule}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-foreground text-background text-xs font-medium rounded-md hover:bg-foreground/90 transition-colors"
          >
            <Sparkles className="h-3 w-3" />
            AI Schedule
          </button>

          {/* Clear schedule */}
          {!showClearConfirm ? (
            <button
              onClick={() => setShowClearConfirm(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border bg-card text-xs hover:bg-destructive/10 hover:border-destructive/30 hover:text-destructive transition-colors"
              title="Clear schedule"
            >
              Clear
            </button>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-destructive/40 bg-destructive/5 text-xs">
              <span className="text-destructive font-medium">Clear schedule?</span>
              <button onClick={clearSchedule} className="px-2 py-0.5 rounded bg-destructive text-destructive-foreground text-xs font-medium hover:bg-destructive/90 transition-colors">Yes</button>
              <button onClick={() => setShowClearConfirm(false)} className="px-2 py-0.5 rounded border border-border text-xs hover:bg-muted transition-colors">No</button>
            </div>
          )}

          {/* Save */}
          {hasUnsaved && (
            <button onClick={handleSave} disabled={isSaving}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white text-xs font-medium rounded-md hover:bg-emerald-700 transition-colors disabled:opacity-60"
            >
              {isSaving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
              Save & Notify
            </button>
          )}
        </div>
      </div>

      {/* ── Team member selector (only shown when team has multiple members) ── */}
      {scheduleMembers.length > 1 && (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="px-4 py-2.5 border-b border-border flex items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground">Team Schedules</span>
          </div>
          <div className="flex gap-2 p-3 overflow-x-auto">
            {scheduleMembers.map(member => (
              <button
                key={member.id}
                onClick={() => setSelectedMemberId(member.id)}
                className={cn(
                  "flex items-center gap-2.5 px-3 py-2 rounded-lg border text-left transition-all shrink-0",
                  selectedMemberId === member.id
                    ? "bg-foreground text-background border-foreground"
                    : "border-border bg-card hover:bg-muted"
                )}
              >
                <div className={cn(
                  "h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-semibold shrink-0",
                  selectedMemberId === member.id
                    ? "bg-background/20 text-background"
                    : "bg-muted text-foreground"
                )}>
                  {member.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-medium truncate max-w-[100px]">
                    {member.isMe ? "You" : member.name}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Working Hours Panel ── */}
      {showHoursPanel && (
        <div className="rounded-lg border border-border bg-card overflow-hidden">
          <div className="px-4 py-2.5 border-b border-border flex items-center gap-2">
            <Settings2 className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-sm font-medium">Working Hours</span>
            <span className="ml-auto text-xs text-muted-foreground">AI respects these windows</span>
          </div>
          <div className="divide-y divide-border">
            {DAYS.map((day, i) => {
              const dh = workingHours[i]
              return (
                <div key={day} className={cn("flex items-center gap-3 px-4 py-2.5", !dh.enabled && "opacity-50")}>
                  <button onClick={() => toggleDay(i)}
                    className={cn("relative inline-flex h-4.5 w-8 shrink-0 rounded-full border-2 border-transparent transition-colors h-[18px]",
                      dh.enabled ? "bg-foreground" : "bg-muted-foreground/30")}
                  >
                    <span className={cn("block h-3.5 w-3.5 rounded-full bg-white shadow-sm transition-transform",
                      dh.enabled ? "translate-x-3.5" : "translate-x-0")} />
                  </button>
                  <span className="w-7 text-xs font-medium">{day}</span>
                  {dh.enabled ? (
                    <div className="flex items-center gap-2">
                      <select value={dh.start} onChange={e => updateStart(i, Number(e.target.value))}
                        className="h-7 px-2 rounded-md border border-border bg-background text-xs cursor-pointer focus:outline-none">
                        {HOUR_OPTIONS.filter(h => h < dh.end).map(h => <option key={h} value={h}>{formatHour(h)}</option>)}
                      </select>
                      <span className="text-xs text-muted-foreground">–</span>
                      <select value={dh.end} onChange={e => updateEnd(i, Number(e.target.value))}
                        className="h-7 px-2 rounded-md border border-border bg-background text-xs cursor-pointer focus:outline-none">
                        {HOUR_OPTIONS.filter(h => h > dh.start).map(h => <option key={h} value={h}>{formatHour(h)}</option>)}
                      </select>
                      <span className="text-xs text-muted-foreground">({dh.end - dh.start}h)</span>
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground">Off</span>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Calendar grid ── */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        {/* Day headers */}
        <div className="grid border-b border-border bg-muted/30" style={{ gridTemplateColumns: "48px repeat(7, 1fr)" }}>
          <div className="border-r border-border" />
          {weekDays.map((date, i) => {
            const isToday   = isSameDay(date, today)
            const enabled   = workingHours[i]?.enabled
            const dayAppts  = appointments.filter(a => a.day === i).length
            return (
              <div key={i}
                className={cn(
                  "flex flex-col items-center justify-center py-2.5 border-r border-border last:border-r-0",
                  !enabled && "opacity-35"
                )}
              >
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{DAYS[i]}</span>
                <div className={cn(
                  "mt-1 w-7 h-7 flex items-center justify-center rounded-full text-sm font-semibold transition-colors",
                  isToday ? "bg-foreground text-background" : "text-foreground"
                )}>
                  {format(date, "d")}
                </div>
                {dayAppts > 0 && (
                  <div className="mt-1 flex gap-0.5">
                    {Array.from({ length: Math.min(dayAppts, 4) }).map((_, j) => (
                      <span key={j} className="w-1 h-1 rounded-full bg-foreground/30" />
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Time grid — no scroll, clipped to working hours range */}
        <div className="relative">
          {/* Current time line */}
          {nowTopPercent >= 0 && (
            <div
              className="absolute z-10 pointer-events-none"
              style={{
                top: `${nowTopPercent}%`,
                left: 48,
                right: 0,
              }}
            >
              <div className="relative flex items-center">
                <div className="absolute -left-1.5 w-2.5 h-2.5 rounded-full bg-red-500 shadow-sm" />
                <div className="w-full h-px bg-red-500/70" />
              </div>
            </div>
          )}

          {visibleHours.map((hour, rowIdx) => (
            <div
              key={hour}
              className="grid border-b border-border/60 last:border-b-0"
              style={{ gridTemplateColumns: "48px repeat(7, 1fr)", height: 52 }}
            >
              {/* Hour label */}
              <div className={cn(
                "flex items-center justify-end pr-2.5 border-r border-border/60 shrink-0",
                rowIdx === 0 ? "items-start pt-1" : ""
              )}>
                <span className="text-[10px] text-muted-foreground/60 font-medium tabular-nums">
                  {formatHour(hour)}
                </span>
              </div>

              {DAYS.map((_, dayIdx) => {
                const appts       = appointments.filter(a => a.day === dayIdx && a.hour === hour)
                const isOver      = dragOver?.day === dayIdx && dragOver?.hour === hour
                const isToday     = todayColIdx === dayIdx
                const inWork      = isWithinWorkingHours(dayIdx, hour)
                const dayEnabled  = workingHours[dayIdx]?.enabled

                return (
                  <div
                    key={dayIdx}
                    onDragOver={e => handleDragOver(e, dayIdx, hour)}
                    onDrop={e => handleDrop(e, dayIdx, hour)}
                    className={cn(
                      "border-r border-border/60 last:border-r-0 px-1 py-1 relative transition-colors",
                      isToday && inWork && "bg-foreground/[0.018]",
                      !inWork && dayEnabled && "bg-muted/25",
                      !dayEnabled && "bg-muted/15",
                      isOver && inWork && "bg-muted ring-1 ring-inset ring-foreground/15",
                      isOver && !inWork && "bg-amber-500/8 ring-1 ring-inset ring-amber-500/20",
                    )}
                  >
                    {appts.map(appt => (
                      <AppointmentCard
                        key={appt.id}
                        appointment={appt}
                        isDragging={dragging === appt.id}
                        isOutsideHours={!inWork}
                        onDragStart={handleDragStart}
                        onDragEnd={handleDragEnd}
                        onRemove={removeAppointment}
                      />
                    ))}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>

      {/* ── Legend + type key ── */}
      <div className="flex items-center gap-3 text-[11px] text-muted-foreground flex-wrap">
        {(Object.entries(TYPE_CONFIG) as [keyof typeof TYPE_CONFIG, typeof TYPE_CONFIG[keyof typeof TYPE_CONFIG]][]).map(([type, cfg]) => (
          <div key={type} className="flex items-center gap-1.5">
            <span className={cn("w-2 h-2 rounded-full", cfg.dot)} />
            {cfg.label}
          </div>
        ))}
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-sm bg-muted-foreground/20 border border-border" />
          Off-hours
        </div>
        {isThisWeek && (
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-500" />
            Now
          </div>
        )}
        <span className="ml-auto">
          {appointments.length} appointment{appointments.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* ── Unscheduled Leads ── */}
      <UnscheduledLeads
        leads={leads}
        appointments={appointments}
        workingHours={workingHours}
        onScheduleClick={lead => {
          const slot = firstAvailableSlot()
          setSchedulePicker({ lead, day: slot.day, hour: slot.hour })
        }}
      />

      {/* ── Schedule picker modal ── */}
      {schedulePicker && (
        <SchedulePickerModal
          lead={schedulePicker.lead}
          initialDay={schedulePicker.day}
          initialHour={schedulePicker.hour}
          workingHours={workingHours}
          onConfirm={(day, hour, type) => {
            setAppointments(prev => [...prev, {
              id: generateId(), leadId: schedulePicker.lead.id,
              leadName: schedulePicker.lead.name, leadEmail: schedulePicker.lead.email,
              leadPhone: schedulePicker.lead.phone, type, day, hour, duration: 1,
            }])
            setToast({ text: `${schedulePicker.lead.name} scheduled` })
            setSchedulePicker(null)
          }}
          onClose={() => setSchedulePicker(null)}
        />
      )}

      {/* ── Toast ── */}
      {toast && (
        <div className={cn(
          "fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-full shadow-lg animate-in fade-in slide-in-from-bottom-2",
          toast.ok === false ? "bg-amber-600 text-white" : "bg-foreground text-background"
        )}>
          {toast.ok !== false && <Check className="h-3.5 w-3.5" />}
          {toast.text}
        </div>
      )}
    </div>
  )
}

// ─── Schedule Picker Modal ─────────────────────────────────────────────────────

function SchedulePickerModal({
  lead, initialDay, initialHour, workingHours, onConfirm, onClose,
}: {
  lead: Lead
  initialDay: number
  initialHour: number
  workingHours: WorkingHours
  onConfirm: (day: number, hour: number, type: Appointment["type"]) => void
  onClose: () => void
}) {
  const enabledDays  = DAYS.map((_, i) => i).filter(i => workingHours[i]?.enabled)
  const defaultDay   = enabledDays.includes(initialDay) ? initialDay : (enabledDays[0] ?? 0)
  const [day,  setDay]  = useState(defaultDay)
  const [hour, setHour] = useState(initialHour)
  const [type, setType] = useState<Appointment["type"]>("call")

  const dh          = workingHours[day]
  const hourOptions = dh ? Array.from({ length: dh.end - dh.start }, (_, i) => dh.start + i) : []

  useEffect(() => {
    if (dh && (hour < dh.start || hour >= dh.end)) setHour(dh.start)
  }, [day, dh, hour])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-sm mx-4">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <div>
            <p className="text-sm font-semibold">Schedule appointment</p>
            <p className="text-xs text-muted-foreground mt-0.5">What time works best?</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-md hover:bg-muted transition-colors">
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>

        <div className="px-4 py-4 space-y-4">
          <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-muted/50">
            <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center text-xs font-semibold shrink-0">
              {lead.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{lead.name}</p>
              <p className="text-xs text-muted-foreground truncate">{lead.email || lead.phone}</p>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Day</label>
            <div className="grid grid-cols-7 gap-1">
              {DAYS.map((d, i) => {
                const enabled = workingHours[i]?.enabled
                return (
                  <button
                    key={d}
                    disabled={!enabled}
                    onClick={() => setDay(i)}
                    className={cn(
                      "py-1.5 rounded-md text-xs font-medium transition-colors",
                      day === i
                        ? "bg-foreground text-background"
                        : enabled
                          ? "bg-muted hover:bg-muted/80"
                          : "bg-muted/30 text-muted-foreground/50 cursor-not-allowed"
                    )}
                  >
                    {d}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Time</label>
            <select
              value={hour}
              onChange={e => setHour(Number(e.target.value))}
              className="w-full h-9 px-3 rounded-md border border-border bg-background text-sm cursor-pointer focus:outline-none"
            >
              {hourOptions.map(h => (
                <option key={h} value={h}>{formatHour(h)}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Type</label>
            <div className="flex gap-2">
              {(Object.keys(TYPE_CONFIG) as Appointment["type"][]).map(t => (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  className={cn(
                    "flex-1 py-2 rounded-md border text-xs font-medium transition-colors",
                    type === t
                      ? "border-foreground bg-foreground text-background"
                      : "border-border bg-card hover:bg-muted"
                  )}
                >
                  {TYPE_CONFIG[t].label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="px-4 pb-4 flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-2 rounded-md border border-border text-sm hover:bg-muted transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(day, hour, type)}
            className="flex-1 py-2 rounded-md bg-foreground text-background text-sm font-medium hover:bg-foreground/90 transition-colors"
          >
            Schedule
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Appointment Card ───────────────────────────────────────────────────────────────

function AppointmentCard({
  appointment: a, isDragging, isOutsideHours, onDragStart, onDragEnd, onRemove,
}: {
  appointment: Appointment
  isDragging: boolean
  isOutsideHours: boolean
  onDragStart: (e: React.DragEvent, id: string) => void
  onDragEnd: () => void
  onRemove: (id: string) => void
}) {
  const [hovered, setHovered] = useState(false)
  const cfg = TYPE_CONFIG[a.type]

  return (
    <div
      draggable
      onDragStart={e => onDragStart(e, a.id)}
      onDragEnd={onDragEnd}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={cn(
        "relative rounded-md border px-1.5 py-1 text-[11px] mb-0.5 last:mb-0 transition-all select-none",
        cfg.color,
        isDragging ? "opacity-40 scale-95" : "cursor-grab active:cursor-grabbing",
        isOutsideHours ? "opacity-60 border-dashed" : ""
      )}
    >
      <div className="flex items-center gap-1 min-w-0">
        <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", cfg.dot)} />
        <span className="font-medium truncate flex-1">{a.leadName}</span>
        {hovered && (
          <button onClick={e => { e.stopPropagation(); onRemove(a.id) }}
            className="shrink-0 opacity-60 hover:opacity-100 transition-opacity ml-0.5"
          >
            <X className="h-2.5 w-2.5" />
          </button>
        )}
      </div>
      <div className="flex items-center gap-1 opacity-60 mt-0.5">
        {a.leadEmail ? <Mail className="h-2 w-2 shrink-0" /> : <Phone className="h-2 w-2 shrink-0" />}
        <span className="text-[10px]">{cfg.label}</span>
        {isOutsideHours && <span className="ml-auto text-[9px] text-amber-500">off-hrs</span>}
      </div>
    </div>
  )
}

// ─── Unscheduled Leads ─────────────────────────────────────────────────────

function UnscheduledLeads({
  leads,
  appointments,
  workingHours,
  onScheduleClick,
}: {
  leads: Lead[]
  appointments: Appointment[]
  workingHours: WorkingHours
  onScheduleClick: (lead: Lead) => void
}) {
  const scheduledIds = new Set(appointments.map(a => a.leadId))

  const unscheduled  = leads
    .filter(l => {
      const status = l.session?.status || l.status
      return (status === "approved" || (l.session?.rating ?? l.rating ?? 0) >= 3) && !scheduledIds.has(l.id)
    })
    .slice(0, 10)

  if (unscheduled.length === 0) return null

  const hasHours = Object.values(workingHours).some(d => d.enabled)

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="px-4 py-2.5 border-b border-border flex items-center gap-2">
        <span className="text-xs font-medium text-muted-foreground">Unscheduled Leads</span>
        <span className="ml-auto text-[10px] text-muted-foreground">{unscheduled.length}</span>
      </div>
      <div className="flex gap-2 p-3 overflow-x-auto">
        {unscheduled.map(lead => (
          <button
            key={lead.id}
            onClick={() => hasHours && onScheduleClick(lead)}
            disabled={!hasHours}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-card text-left transition-all shrink-0 hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-[10px] font-semibold shrink-0">
              {lead.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-medium truncate max-w-[120px]">{lead.name}</div>
              <div className="text-[10px] text-muted-foreground capitalize">
                {lead.session?.status || lead.status}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}