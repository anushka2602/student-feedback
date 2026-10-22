import { NextResponse } from 'next/server'
import { ANONYMOUS_MODE, COMMENT_MAX } from '@/lib/config'
import { ACADEMIC_ITEMS, factorsFor } from '@/lib/constants'
import { db } from '@/lib/server/db'
import { HttpError, rateLimit, readJson, route } from '@/lib/server/http'
import { requireRole } from '@/lib/server/session'

interface Item { item?: string; factors?: { factor?: string; rating?: number; comment?: string }[] }

export const POST = route(async req => {
  const s = await requireRole('student')
  rateLimit(`submit:${s.id}`, 10, 10 * 60_000)
  const { items } = await readJson<{ items?: Item[] }>(req)
  if (!Array.isArray(items) || items.length === 0 || items.length > ACADEMIC_ITEMS.length) throw new HttpError(400, 'Rate at least one item before submitting.')

  const { data: existing, error: e1 } = await db().from('academic_feedback').select('teacher_name').eq('student_id', s.id).limit(1000)
  if (e1) throw e1
  const done = new Set((existing ?? []).map(r => r.teacher_name as string))

  const rows: Record<string, unknown>[] = []
  const saved: string[] = [], skipped: string[] = []
  for (const it of items) {
    const name = it.item ?? ''
    if (!ACADEMIC_ITEMS.includes(name)) throw new HttpError(400, `Unknown item: ${name.slice(0, 40)}`)
    if (done.has(name) || saved.includes(name)) { skipped.push(name); continue }
    const allowed = factorsFor(name)
    const seen = new Set<string>()
    for (const f of it.factors ?? []) {
      const rating = Number(f.rating)
      if (!f.factor || !allowed.includes(f.factor) || seen.has(f.factor)) continue
      if (!Number.isInteger(rating) || rating < 1 || rating > 10) throw new HttpError(400, 'Ratings must be whole numbers from 1 to 10.')
      seen.add(f.factor)
      rows.push({
        student_id: s.id,
        student_name: ANONYMOUS_MODE ? 'Anonymous' : s.name,
        teacher_name: name,
        factor: f.factor,
        rating,
        comment: (typeof f.comment === 'string' ? f.comment.trim() : '').slice(0, COMMENT_MAX),
      })
    }
    if (seen.size) saved.push(name)
  }
  if (rows.length === 0) throw new HttpError(409, skipped.length ? 'You have already submitted feedback for these.' : 'Rate at least one item before submitting.')

  const { error } = await db().from('academic_feedback').insert(rows)
  if (error) throw error
  return NextResponse.json({ saved, skipped })
})
