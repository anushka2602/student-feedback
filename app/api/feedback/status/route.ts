import { NextResponse } from 'next/server'
import { db } from '@/lib/server/db'
import { route, } from '@/lib/server/http'
import { requireRole } from '@/lib/server/session'

export const GET = route(async () => {
  const s = await requireRole('student')
  const [a, n] = await Promise.all([
    db().from('academic_feedback').select('teacher_name').eq('student_id', s.id).limit(1000),
    db().from('non_academic_feedback').select('category').eq('student_id', s.id).limit(1000),
  ])
  if (a.error) throw a.error
  if (n.error) throw n.error
  return NextResponse.json({
    academic: [...new Set((a.data ?? []).map(r => r.teacher_name as string))],
    nonAcademic: [...new Set((n.data ?? []).map(r => r.category as string))],
  })
})
