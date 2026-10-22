import { NextResponse } from 'next/server'
import { db } from '@/lib/server/db'
import { HttpError, rateLimit, readJson, route } from '@/lib/server/http'
import { hashPassword, verifyPassword } from '@/lib/server/password'
import { getSession } from '@/lib/server/session'

export const POST = route(async req => {
  const s = await getSession()
  if (!s) throw new HttpError(401, 'Please sign in again.')
  rateLimit(`pw:${s.id}`, 6, 15 * 60_000)

  const body = await readJson<{ current?: string; next?: string }>(req)
  const current = typeof body.current === 'string' ? body.current : ''
  const next = typeof body.next === 'string' ? body.next : ''
  if (next.length < 8) throw new HttpError(400, 'New password must be at least 8 characters.')
  if (next.length > 128) throw new HttpError(400, 'New password is too long.')
  if (next === current) throw new HttpError(400, 'Choose a password different from the current one.')

  const { data } = await db().from('users').select('password').eq('id', s.id).maybeSingle()
  const { ok } = await verifyPassword(current, data?.password)
  if (!ok) throw new HttpError(400, 'Current password is incorrect.')

  const { error } = await db().from('users').update({ password: await hashPassword(next) }).eq('id', s.id)
  if (error) throw error
  return NextResponse.json({ ok: true })
})
