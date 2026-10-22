import { NextResponse } from 'next/server'
import { ANONYMOUS_MODE, COMMENT_MAX } from '@/lib/config'
import { NON_ACADEMIC_CATEGORIES } from '@/lib/constants'
import { db } from '@/lib/server/db'
import { HttpError, rateLimit, readJson, route } from '@/lib/server/http'
import { requireRole } from '@/lib/server/session'

interface Item { category?: string; rating?: number; comment?: string }

export const POST = route(async req => {
  const s = await requireRole('student')
  rateLimit(`submit:${s.id}`, 10, 10 * 60_000)
  const { items } = await readJson<{ items?: Item[] }>(req)
  if (!Array.isArray(items) || items.length === 0 || items.length > NON_ACADEMIC_CATEGORIES.length) throw new HttpError(400, 'Rate at least one category before submitting.')

  const { data: existing, error: e1 } = await db().from('non_academic_feedback').select('category').eq('student_id', s.id).limit(1000)
  if (e1) throw e1
  const done = new Set((existing ?? []).map(r => r.category as string))

  const rows: Record<string, unknown>[] = []
  const saved: string[] = [], skipped: string[] = []
  for (const it of items) {
    const category = it.category ?? ''
    if (!NON_ACADEMIC_CATEGORIES.includes(category)) throw new HttpError(400, `Unknown category: ${category.slice(0, 40)}`)
    if (done.has(category) || saved.includes(category)) { skipped.push(category); continue }
    const rating = Number(it.rating)
    if (!Number.isInteger(rating) || rating < 1 || rating > 10) throw new HttpError(400, 'Ratings must be whole numbers from 1 to 10.')
    saved.push(category)
    rows.push({
      student_id: s.id,
      student_name: ANONYMOUS_MODE ? 'Anonymous' : s.name,
      category,
      rating,
      comment: (typeof it.comment === 'string' ? it.comment.trim() : '').slice(0, COMMENT_MAX),
    })
  }
  if (rows.length === 0) throw new HttpError(409, 'You have already submitted feedback for these.')

  const { error } = await db().from('non_academic_feedback').insert(rows)
  if (error) throw error
  return NextResponse.json({ saved, skipped })
})
