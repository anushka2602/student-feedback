import { NextResponse } from 'next/server'
import { ALL_FACTORS } from '@/lib/constants'
import { avg } from '@/lib/rating'
import { fetchAll } from '@/lib/server/db'
import { route } from '@/lib/server/http'
import { requireRole } from '@/lib/server/session'

interface Row { factor: string; rating: number; comment: string | null; student_id: string; submitted_at: string }

export const GET = route(async () => {
  const s = await requireRole('teacher')
  const rows = await fetchAll<Row>('academic_feedback', 'factor, rating, comment, student_id, submitted_at', q => q.eq('teacher_name', s.name))

  const factors = ALL_FACTORS.flatMap(factor => {
    const fr = rows.filter(r => r.factor === factor)
    if (!fr.length) return []
    const distribution = Array.from({ length: 10 }, (_, i) => fr.filter(r => r.rating === i + 1).length)
    const comments = fr
      .filter(r => r.comment?.trim())
      .sort((a, b) => b.submitted_at.localeCompare(a.submitted_at))
      .slice(0, 100)
      .map(r => ({ comment: r.comment!.trim(), rating: r.rating }))
    return [{ factor, average: avg(fr.map(r => r.rating)), count: fr.length, distribution, comments }]
  })

  return NextResponse.json({
    name: s.name,
    overall: avg(rows.map(r => r.rating)),
    responses: rows.length,
    respondents: new Set(rows.map(r => r.student_id)).size,
    distribution: Array.from({ length: 10 }, (_, i) => rows.filter(r => r.rating === i + 1).length),
    factors,
  })
})
