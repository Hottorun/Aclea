"use client"

import { Users, UserPlus, CheckCircle, TrendingUp } from "lucide-react"
import type { Lead } from "@/lib/types"

interface StatsCardsProps {
  leads: Lead[]
}

export function StatsCards({ leads }: StatsCardsProps) {
  const total = leads.length
  const newLeads = leads.filter((l) => l.status === "new").length
  const converted = leads.filter((l) => l.status === "converted").length
  const conversionRate = total > 0 ? Math.round((converted / total) * 100) : 0

  const stats = [
    {
      label: "Total Leads",
      value: total,
      icon: Users,
      color: "text-foreground",
      bgColor: "bg-secondary",
    },
    {
      label: "New Leads",
      value: newLeads,
      icon: UserPlus,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      label: "Converted",
      value: converted,
      icon: CheckCircle,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      label: "Conversion Rate",
      value: `${conversionRate}%`,
      icon: TrendingUp,
      color: "text-chart-3",
      bgColor: "bg-chart-3/10",
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon
        return (
          <div
            key={stat.label}
            className="rounded-xl border border-border bg-card p-5"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="mt-1 text-2xl font-semibold text-card-foreground">
                  {stat.value}
                </p>
              </div>
              <div className={`rounded-lg p-2.5 ${stat.bgColor}`}>
                <Icon className={`h-5 w-5 ${stat.color}`} />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
