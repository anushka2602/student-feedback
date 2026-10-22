import { NextResponse } from 'next/server'
import { NON_ACADEMIC_CATEGORIES } from '@/lib/constants'
import { avg } from '@/lib/rating'
import { fetchAll } from '@/lib/server/db'
import { route } from '@/lib/server/http'
import { requireRole } from '@/lib/server/session'

interface A { teacher_name: string; rating: number; student_id: string }
interface N { category: string; rating: number; student_id: string }

export const GET = route(async () => {
  await requireRole('admin')
  const [a, n] = await Promise.all([
    fetchAll<A>('academic_feedback', 'teacher_name, rating, student_id'),
    fetchAll<N>('non_academic_feedback', 'category, rating, student_id'),
  ])

  const group = <T,>(rows: T[], key: (r: T) => string) => {
    const m = new Map<string, T[]>()
    rows.forEach(r => m.set(key(r), [...(m.get(key(r)) ?? []), r]))
    return m
  }

  const teachers = [...group(a, r => r.teacher_name)].map(([name, rs]) => ({
    name, average: avg(rs.map(r => r.rating)), responses: rs.length, respondents: new Set(rs.map(r => r.student_id)).size,
  })).sort((x, y) => (y.average ?? 0) - (x.average ?? 0))

  const byCat = group(n, r => r.category)
  const categories = NON_ACADEMIC_CATEGORIES.filter(c => byCat.has(c)).map(name => {
    const rs = byCat.get(name)!
    return { name, average: avg(rs.map(r => r.rating)), responses: rs.length }
  }).sort((x, y) => (y.average ?? 0) - (x.average ?? 0))

  return NextResponse.json({
    students: new Set([...a.map(r => r.student_id), ...n.map(r => r.student_id)]).size,
    academicResponses: a.length,
    nonAcademicResponses: n.length,
    academicAverage: avg(a.map(r => r.rating)),
    nonAcademicAverage: avg(n.map(r => r.rating)),
    teachers,
    categories,
  })
})
