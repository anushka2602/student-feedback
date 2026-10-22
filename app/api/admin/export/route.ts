import { ANONYMOUS_MODE } from '@/lib/config'
import { csvCell } from '@/lib/csv'
import { fetchAll } from '@/lib/server/db'
import { route } from '@/lib/server/http'
import { requireRole } from '@/lib/server/session'

export const GET = route(async req => {
  await requireRole('admin')
  const academic = req.nextUrl.searchParams.get('type') !== 'non-academic'
  const rows = await fetchAll<Record<string, unknown>>(
    academic ? 'academic_feedback' : 'non_academic_feedback', '*', q => q.order('submitted_at', { ascending: false }),
  )
  const cols = [
    'submitted_at',
    ...(academic ? ['teacher_name', 'factor'] : ['category']),
    'rating', 'comment',
    ...(ANONYMOUS_MODE ? [] : ['student_name']),
  ]
  const csv = '\uFEFF' + [cols.join(','), ...rows.map(r => cols.map(c => csvCell(r[c])).join(','))].join('\r\n')
  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${academic ? 'academic' : 'non-academic'}-feedback-${new Date().toISOString().slice(0, 10)}.csv"`,
      'Cache-Control': 'no-store',
    },
  })
})
