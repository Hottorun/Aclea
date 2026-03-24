"use client"

import { useState } from "react"
import {
  X,
  Phone,
  MessageSquare,
  Calendar,
  User,
  Tag,
  FileText,
  Trash2,
  ExternalLink,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { Lead, LeadStatus, LeadTag } from "@/lib/types"
import { cn } from "@/lib/utils"
import { teamMembers } from "@/lib/mock-data"

interface LeadDetailPanelProps {
  lead: Lead
  onClose: () => void
  onUpdate: (updates: Partial<Lead>) => void
  onDelete: () => void
}

const statusOptions: { value: LeadStatus; label: string }[] = [
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "qualified", label: "Qualified" },
  { value: "converted", label: "Converted" },
  { value: "lost", label: "Lost" },
]

const tagOptions: { value: LeadTag; label: string; className: string }[] = [
  { value: "hot", label: "Hot", className: "bg-destructive/20 text-destructive" },
  { value: "warm", label: "Warm", className: "bg-chart-3/20 text-chart-3" },
  { value: "cold", label: "Cold", className: "bg-chart-2/20 text-chart-2" },
  { value: "vip", label: "VIP", className: "bg-chart-4/20 text-chart-4" },
  { value: "follow-up", label: "Follow-up", className: "bg-chart-5/20 text-chart-5" },
  { value: "urgent", label: "Urgent", className: "bg-destructive/20 text-destructive" },
]

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function LeadDetailPanel({ lead, onClose, onUpdate, onDelete }: LeadDetailPanelProps) {
  const [newNote, setNewNote] = useState("")

  const toggleTag = (tag: LeadTag) => {
    const newTags = lead.tags.includes(tag)
      ? lead.tags.filter((t) => t !== tag)
      : [...lead.tags, tag]
    onUpdate({ tags: newTags })
  }

  const addNote = () => {
    if (!newNote.trim()) return
    onUpdate({ notes: [...lead.notes, newNote.trim()] })
    setNewNote("")
  }

  const openWhatsApp = () => {
    const phone = lead.phone.replace(/\D/g, "")
    window.open(`https://wa.me/${phone}`, "_blank")
  }

  return (
    <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l border-border bg-background shadow-xl">
      <div className="flex items-center justify-between border-b border-border p-4">
        <h2 className="text-lg font-semibold text-foreground">Lead Details</h2>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-5 w-5" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {/* Contact Info */}
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-secondary text-lg font-semibold text-foreground">
            {lead.name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .slice(0, 2)
              .toUpperCase()}
          </div>
          <div>
            <h3 className="text-xl font-semibold text-foreground">{lead.name}</h3>
            <p className="text-muted-foreground">{lead.phone}</p>
          </div>
        </div>

        <Button
          onClick={openWhatsApp}
          className="mt-4 w-full bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <ExternalLink className="mr-2 h-4 w-4" />
          Open in WhatsApp
        </Button>

        {/* Message */}
        <div className="mt-6">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <MessageSquare className="h-4 w-4" />
            Message
          </div>
          <p className="mt-2 rounded-lg bg-secondary p-3 text-sm text-foreground">{lead.message}</p>
        </div>

        {/* Status */}
        <div className="mt-6">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Phone className="h-4 w-4" />
            Status
          </div>
          <Select
            value={lead.status}
            onValueChange={(value: LeadStatus) => onUpdate({ status: value })}
          >
            <SelectTrigger className="mt-2 bg-secondary">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Assigned To */}
        <div className="mt-6">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <User className="h-4 w-4" />
            Assigned To
          </div>
          <Select
            value={lead.assignedTo || "unassigned"}
            onValueChange={(value) => onUpdate({ assignedTo: value === "unassigned" ? null : value })}
          >
            <SelectTrigger className="mt-2 bg-secondary">
              <SelectValue placeholder="Unassigned" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="unassigned">Unassigned</SelectItem>
              {teamMembers.map((member) => (
                <SelectItem key={member} value={member}>
                  {member}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Tags */}
        <div className="mt-6">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Tag className="h-4 w-4" />
            Tags
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {tagOptions.map((tag) => {
              const isActive = lead.tags.includes(tag.value)
              return (
                <button
                  key={tag.value}
                  onClick={() => toggleTag(tag.value)}
                  className={cn(
                    "rounded-md px-3 py-1.5 text-sm font-medium transition-all",
                    isActive
                      ? tag.className
                      : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                  )}
                >
                  {tag.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Notes */}
        <div className="mt-6">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <FileText className="h-4 w-4" />
            Notes
          </div>
          <div className="mt-2 space-y-2">
            {lead.notes.map((note, index) => (
              <div key={index} className="rounded-lg bg-secondary p-3 text-sm text-foreground">
                {note}
              </div>
            ))}
          </div>
          <div className="mt-3 flex gap-2">
            <input
              type="text"
              placeholder="Add a note..."
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addNote()}
              className="flex-1 rounded-lg border border-input bg-secondary px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
            />
            <Button onClick={addNote} size="sm">
              Add
            </Button>
          </div>
        </div>

        {/* Timestamps */}
        <div className="mt-6 space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Created: {formatDate(lead.createdAt)}
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Updated: {formatDate(lead.updatedAt)}
          </div>
        </div>

        {/* Source */}
        <div className="mt-4">
          <Badge variant="outline" className="text-muted-foreground">
            Source: {lead.source}
          </Badge>
        </div>
      </div>

      {/* Delete Button */}
      <div className="border-t border-border p-4">
        <Button
          variant="destructive"
          className="w-full"
          onClick={onDelete}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete Lead
        </Button>
      </div>
    </div>
  )
}
