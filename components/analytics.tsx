"use client"

import { useState, useMemo, useRef, useEffect } from "react"
import { Clock, CheckCircle, XCircle, Star, TrendingUp, Users, MessageCircle, Mail, Hand, Download, TrendingDown } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell } from "recharts"
import pdfMake from "pdfmake/build/pdfmake"
import { cn } from "@/lib/utils"
import type { Lead } from "@/lib/types"
import html2canvas from "html2canvas"

interface AnalyticsProps {
  leads: Lead[]
}

export function Analytics({ leads }: AnalyticsProps) {
  const [timeRange, setTimeRange] = useState<"week" | "month" | "all">("week")
  const [downloading, setDownloading] = useState(false)
  const [uiStyle, setUIStyle] = useState<"colored" | "minimal">("colored")
  const growthChartRef = useRef<HTMLDivElement>(null)
  const sourceChartRef = useRef<HTMLDivElement>(null)
  const statusChartRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const savedStyle = (localStorage.getItem("uiStyle") || "colored") as "colored" | "minimal"
    setUIStyle(savedStyle)
  }, [])

  const getLeadStatus = (lead: Lead) => lead.session?.status || lead.status || "pending"
  const getLeadRating = (lead: Lead) => lead.session?.rating ?? lead.rating ?? 0
  const getLeadSource = (lead: Lead) => {
    if (lead.phone) return "whatsapp"
    if (lead.email) return "email"
    return "manual"
  }

  const pending = leads.filter(l => getLeadStatus(l) === "pending")
  const approved = leads.filter(l => getLeadStatus(l) === "approved")
  const declined = leads.filter(l => getLeadStatus(l) === "declined")
  const manual = leads.filter(l => getLeadStatus(l) === "manual")

  const avgRating = leads.length > 0 
    ? (leads.reduce((sum, l) => sum + getLeadRating(l), 0) / leads.length).toFixed(1)
    : "0"

  const approvalRate = leads.length > 0
    ? Math.round((approved.length / leads.length) * 100)
    : 0

  const getValueColor = (value: number, type: 'high' | 'rate' | 'neutral') => {
    if (type === 'high') {
      if (value >= 10) return "#16a34a"
      if (value >= 5) return "#d97706"
      return "#dc2626"
    }
    if (type === 'rate') {
      if (value >= 60) return "#16a34a"
      if (value >= 30) return "#d97706"
      return "#dc2626"
    }
    return "#1e293b"
  }

  const statBlocks = [
    { label: "Total Leads", value: leads.length, trend: "+12%", color: getValueColor(leads.length, 'neutral') },
    { label: "Approved", value: approved.length, trend: "+8%", color: getValueColor(approved.length, 'high') },
    { label: "Pending", value: pending.length, trend: "-3%", color: getValueColor(pending.length, 'rate') },
    { label: "Declined", value: declined.length, trend: "+2%", color: getValueColor(declined.length, 'rate') },
    { label: "Avg Rating", value: avgRating, trend: "+0.3", color: getValueColor(parseFloat(avgRating), 'high'), suffix: "/5" },
    { label: "Approval Rate", value: `${approvalRate}%`, trend: "+5%", color: getValueColor(approvalRate, 'rate') },
  ]

  const mockSourceData = [
    { source: "Organic", value: Math.floor(leads.length * 0.35) },
    { source: "Referral", value: Math.floor(leads.length * 0.28) },
    { source: "Paid Ads", value: Math.floor(leads.length * 0.22) },
    { source: "Direct", value: Math.floor(leads.length * 0.15) },
  ]

  const growthData = useMemo(() => {
    const now = new Date()
    const data: { date: string; leads: number; approved: number; pending: number }[] = []
    
    let days = 7
    if (timeRange === "month") days = 30
    if (timeRange === "all") days = Math.min(90, Math.max(...leads.map(l => Math.floor((now.getTime() - new Date(l.createdAt).getTime()) / (1000 * 60 * 60 * 24)))))
    
    for (let i = days; i >= 0; i--) {
      const date = new Date(now)
      date.setDate(date.getDate() - i)
      const dateStr = date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
      
      const cumulativeLeads = leads.filter(l => new Date(l.createdAt) <= date).length
      const cumulativeApproved = approved.filter(l => new Date(l.createdAt) <= date).length
      const cumulativePending = leads.filter(l => new Date(l.createdAt) <= date && getLeadStatus(l) === "pending").length
      
      data.push({
        date: dateStr,
        leads: cumulativeLeads,
        approved: cumulativeApproved,
        pending: cumulativePending,
      })
    }
    
    return data
  }, [leads, timeRange, approved])

  const captureCharts = async () => {
    const chartRefs = [growthChartRef, sourceChartRef, statusChartRef]
    const images: string[] = []
    
    for (const ref of chartRefs) {
      if (ref.current) {
        let iframe: HTMLIFrameElement | null = null
        
        try {
          iframe = document.createElement('iframe')
          iframe.style.cssText = 'position:absolute;left:-9999px;top:0;width:800px;height:600px;'
          document.body.appendChild(iframe)
          
          const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document
          if (!iframeDoc) throw new Error('Cannot access iframe document')
          
          iframeDoc.open()
          iframeDoc.write(`
            <!DOCTYPE html>
            <html>
            <head>
              <style>
                * { box-sizing: border-box; margin: 0; padding: 0; }
                body { background: #ffffff; padding: 20px; font-family: system-ui, sans-serif; }
              </style>
            </head>
            <body></body>
            </html>
          `)
          iframeDoc.close()
          
          const clone = ref.current.cloneNode(true) as HTMLElement
          clone.style.backgroundColor = '#ffffff'
          clone.querySelectorAll('svg').forEach(svg => {
            svg.removeAttribute('class')
          })
          iframeDoc.body.appendChild(clone)
          
          await new Promise(resolve => setTimeout(resolve, 100))
          
          const canvas = await html2canvas(clone, {
            backgroundColor: '#ffffff',
            scale: 2,
            useCORS: true,
            logging: false,
            windowWidth: iframeDoc.documentElement.scrollWidth,
            windowHeight: iframeDoc.documentElement.scrollHeight,
          })
          
          document.body.removeChild(iframe)
          
          const dataUrl = canvas.toDataURL('image/png')
          if (dataUrl && dataUrl.length > 100) {
            images.push(dataUrl)
          } else {
            images.push('')
          }
        } catch (error) {
          console.error('Error capturing chart:', error)
          if (iframe && document.body.contains(iframe)) {
            document.body.removeChild(iframe)
          }
          images.push('')
        }
      } else {
        images.push('')
      }
    }
    
    return images
  }

  const handleDownloadPDF = async () => {
    setDownloading(true)
    
    try {
      const [growthImage, sourceImage] = await captureCharts()
      
      const content: any[] = [
        {
          text: `Generated: ${new Date().toLocaleDateString()}`,
          style: 'subheader',
          alignment: 'center',
          margin: [0, 0, 0, 20]
        },
        {
          canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 1, lineColor: '#e5e7eb' }],
          margin: [0, 0, 0, 20]
        },
        {
          text: 'Summary',
          style: 'sectionHeader'
        },
        {
          table: {
            headerRows: 0,
            widths: ['*', 'auto'],
            body: [
              [{ text: 'Metric', bold: true }, { text: 'Value', bold: true }],
              ['Total Leads', leads.length.toString()],
              ['Pending', pending.length.toString()],
              ['Approved', approved.length.toString()],
              ['Declined', declined.length.toString()],
              ['Average Rating', `${avgRating}/5`],
              ['Approval Rate', `${approvalRate}%`],
            ]
          },
          layout: 'lightHorizontalLines',
          margin: [0, 10, 0, 20]
        },
      ]

      if (growthImage) {
        content.push(
          { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 1, lineColor: '#e5e7eb' }], margin: [0, 0, 0, 20] },
          { text: 'Lead Growth Trend', style: 'sectionHeader' },
          { image: growthImage, width: 500, alignment: 'center', margin: [0, 10, 0, 20] }
        )
      }

      content.push(
        { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 1, lineColor: '#e5e7eb' }], margin: [0, 0, 0, 20] },
        { text: 'Recent Leads', style: 'sectionHeader' },
        { ul: leads.slice(0, 10).map((lead, i) => `${i + 1}. ${lead.name} - ${getLeadStatus(lead)} - ${getLeadRating(lead)}/5 stars`), margin: [0, 10, 0, 0] }
      )

      const docDefinition: any = {
        pageSize: 'A4',
        pageMargins: [40, 60, 40, 60],
        header: {
          text: 'Aclea Analytics Report',
          style: 'header',
          alignment: 'center',
          margin: [0, 20, 0, 10]
        },
        footer: function(currentPage: number, pageCount: number) {
          return {
            text: `Generated by Aclea Lead Management System - Page ${currentPage} of ${pageCount}`,
            alignment: 'center',
            margin: [0, 20, 0, 0],
            style: 'footer'
          }
        },
        content,
        styles: {
          header: {
            fontSize: 24,
            color: '#1e293b',
            bold: true
          },
          subheader: {
            fontSize: 12,
            color: '#64748b'
          },
          sectionHeader: {
            fontSize: 16,
            color: '#1e293b',
            bold: true
          },
          footer: {
            fontSize: 10,
            color: '#94a3b8'
          }
        },
        defaultStyle: {
          fontSize: 12,
          color: '#475569'
        }
      }

      pdfMake.createPdf(docDefinition).download(`aclea-analytics-${new Date().toISOString().split("T")[0]}.pdf`)
    } catch (error) {
      console.error('Error generating PDF:', error)
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className="bg-white min-h-screen">
      <div className="p-6">
        <div className="flex items-center justify-between pb-6 border-b border-gray-200">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Analytics</h1>
            <p className="text-sm text-gray-500 mt-1">Track your lead performance</p>
          </div>
          <button
            onClick={handleDownloadPDF}
            disabled={downloading}
            className={cn(
              "flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors cursor-pointer border",
              downloading
                ? "border-gray-300 text-gray-400 cursor-not-allowed"
                : "border-gray-400 text-gray-700 hover:border-gray-700 hover:text-gray-900"
            )}
          >
            {downloading ? (
              <>
                <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                Export Report
              </>
            )}
          </button>
        </div>

        <div className="flex items-center gap-12 py-6 border-b border-gray-200">
          {statBlocks.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-[32px] font-bold" style={{ color: stat.color }}>
                {stat.value}{stat.suffix}
              </p>
              <p className="text-xs text-gray-400 mt-1">{stat.label}</p>
              <p className="text-xs text-gray-400 mt-0.5">
                {stat.trend.startsWith('+') ? '↑' : '↓'} {stat.trend.replace('+', '').replace('-', '')} vs last week
              </p>
            </div>
          ))}
        </div>

        <div className="py-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-bold text-slate-900">Lead Growth</h2>
              <div className="flex gap-0.5 bg-gray-100 rounded-md p-0.5">
                {(["week", "month", "all"] as const).map((range) => (
                  <button
                    key={range}
                    onClick={() => setTimeRange(range)}
                    className={cn(
                      "px-3 py-1 text-sm font-medium rounded transition-colors",
                      timeRange === range
                        ? "bg-white text-gray-900 shadow-sm border border-gray-200"
                        : "text-gray-500 hover:text-gray-700"
                    )}
                  >
                    {range.charAt(0).toUpperCase() + range.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="h-72" ref={growthChartRef}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={growthData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorLeadsNew" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1e293b" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#1e293b" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorApprovedNew" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#d97706" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#d97706" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="0" stroke="#f3f4f6" />
                <XAxis dataKey="date" stroke="#9ca3af" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#9ca3af" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "#fff", 
                    border: "1px solid #e5e7eb", 
                    borderRadius: "4px",
                    fontSize: "12px",
                    boxShadow: "none"
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="leads"
                  stroke="#1e293b"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorLeadsNew)"
                  name="Total Leads"
                  dot={false}
                  activeDot={{ r: 4, strokeWidth: 0 }}
                />
                <Area
                  type="monotone"
                  dataKey="approved"
                  stroke="#d97706"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorApprovedNew)"
                  name="Approved"
                  dot={false}
                  activeDot={{ r: 4, strokeWidth: 0 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center gap-6 mt-3">
            <div className="flex items-center gap-2">
              <div className="w-3 h-0.5 bg-gray-800" />
              <span className="text-xs font-medium text-gray-500">Total Leads</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-0.5 bg-amber-600" />
              <span className="text-xs font-medium text-gray-500">Approved</span>
            </div>
          </div>
        </div>

        <div className="py-6 grid grid-cols-2 gap-12">
          <div>
            <h2 className="text-lg font-bold text-slate-900 mb-4">Leads by Source</h2>
            <div className="h-56" ref={sourceChartRef}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mockSourceData} layout="vertical" margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="0" stroke="#f3f4f6" horizontal={false} />
                  <XAxis type="number" stroke="#9ca3af" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis dataKey="source" type="category" stroke="#9ca3af" fontSize={11} width={70} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "#fff", 
                      border: "1px solid #e5e7eb", 
                      borderRadius: "4px",
                      fontSize: "12px"
                    }}
                  />
                  <Bar dataKey="value" fill="#1e293b" radius={[0, 2, 2, 0]} barSize={16} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-bold text-slate-900 mb-4">Status Distribution</h2>
            <div className="flex items-center justify-between h-56" ref={statusChartRef}>
              <div className="h-full flex items-center justify-center">
                <ResponsiveContainer width={200} height={200}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Approved', value: approved.length },
                        { name: 'Pending', value: pending.length },
                        { name: 'Manual', value: manual.length },
                        { name: 'Declined', value: declined.length },
                      ]}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      <Cell fill="#16a34a" />
                      <Cell fill="#d97706" />
                      <Cell fill="#1e293b" />
                      <Cell fill="#dc2626" />
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: "#fff", 
                        border: "1px solid #e5e7eb", 
                        borderRadius: "4px",
                        fontSize: "12px"
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-sm bg-green-600" />
                  <span className="text-xs text-gray-500">Approved ({approved.length})</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-sm bg-amber-600" />
                  <span className="text-xs text-gray-500">Pending ({pending.length})</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-sm bg-gray-800" />
                  <span className="text-xs text-gray-500">Manual ({manual.length})</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-sm bg-red-600" />
                  <span className="text-xs text-gray-500">Declined ({declined.length})</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
