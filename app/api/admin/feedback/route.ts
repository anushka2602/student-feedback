import { NextResponse } from 'next/server'
import { ANONYMOUS_MODE, PAGE_SIZE } from '@/lib/config'
import { db } from '@/lib/server/db'
import { escapeLike, HttpError, route, str } from '@/lib/server/http'
import { requireRole } from '@/lib/server/session'

export const GET = route(async req => {
  await requireRole('admin')
  const p = req.nextUrl.searchParams
  const type = p.get('type') === 'non-academic' ? 'non_academic_feedback' : 'academic_feedback'
  const page = Math.max(1, parseInt(p.get('page') ?? '1', 10) || 1)
  const sort = p.get('sort') ?? 'new'

  let q = db().from(type).select('*', { count: 'exact' })
  const teacher = str(p.get('teacher')), factor = str(p.get('factor')), category = str(p.get('category')), search = str(p.get('q'), 100)
  if (type === 'academic_feedback') {
    if (teacher) q = q.eq('teacher_name', teacher)
    if (factor) q = q.eq('factor', factor)
  } else if (category) q = q.eq('category', category)
  if (search) q = q.ilike('comment', `%${escapeLike(search)}%`)
  if (p.get('withComments') === '1') q = q.neq('comment', '')

  q = sort === 'high' ? q.order('rating', { ascending: false }) : sort === 'low' ? q.order('rating', { ascending: true }) : q
  q = q.order('submitted_at', { ascending: false })

  const from = (page - 1) * PAGE_SIZE
  const { data, count, error } = await q.range(from, from + PAGE_SIZE - 1)
  if (error) throw new HttpError(500, 'Could not load feedback.')

  const rows = (data ?? []).map(({ student_id: _s, ...r }) => (ANONYMOUS_MODE ? { ...r, student_name: undefined } : r)) // eslint-disable-line @typescript-eslint/no-unused-vars
  return NextResponse.json({ rows, total: count ?? 0, page, pageSize: PAGE_SIZE })
})
