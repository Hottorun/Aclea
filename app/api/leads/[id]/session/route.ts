import { NextResponse } from "next/server"
import { getLeadById, updateLeadSession } from "@/lib/supabase"
import { getCurrentUser } from "@/lib/auth"

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { id: leadId } = await params

    const existing = await getLeadById(leadId)
    if (!existing) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 })
    }
    if (existing.teamId && user.teamId && existing.teamId !== user.teamId) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 })
    }

    if (!existing.session?.id) {
      return NextResponse.json({ error: "No session found for this lead" }, { status: 404 })
    }

    const body = await request.json()
    const { collectedData, status, rating, ratingReason, needsMoreInfo, currentStep, forwardedAt } = body

    const sessionUpdate: Partial<{
      collectedData: Record<string, string>
      status: string
      rating: number
      ratingReason: string
      needsMoreInfo: boolean
      currentStep: string
      forwardedAt: string
    }> = {}

    if (collectedData !== undefined) sessionUpdate.collectedData = collectedData
    if (status !== undefined) sessionUpdate.status = status
    if (rating !== undefined) sessionUpdate.rating = rating
    if (ratingReason !== undefined) sessionUpdate.ratingReason = ratingReason
    if (needsMoreInfo !== undefined) sessionUpdate.needsMoreInfo = needsMoreInfo
    if (currentStep !== undefined) sessionUpdate.currentStep = currentStep
    if (forwardedAt !== undefined) sessionUpdate.forwardedAt = forwardedAt

    const updatedSession = await updateLeadSession(existing.session.id, sessionUpdate)

    if (!updatedSession) {
      return NextResponse.json({ error: "Failed to update session" }, { status: 500 })
    }

    return NextResponse.json(updatedSession)
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    )
  }
}
