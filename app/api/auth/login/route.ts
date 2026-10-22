import { NextResponse } from 'next/server'
import { db } from '@/lib/server/db'
import { clientIp, escapeLike, rateLimit, readJson, route, str } from '@/lib/server/http'
import { hashPassword, verifyPassword } from '@/lib/server/password'
import { startSession } from '@/lib/server/session'
import { isRole, SessionUser } from '@/lib/types'

export const POST = route(async req => {
  const body = await readJson(req)
  const id = str(body.display_id, 64)
  const password = typeof body.password === 'string' ? body.password.slice(0, 200) : ''
  if (!id || !password || !isRole(body.role)) return NextResponse.json({ error: 'Enter your ID and password.' }, { status: 400 })

  const ip = clientIp(req)
  rateLimit(`login-ip:${ip}`, 40, 10 * 60_000)
  rateLimit(`login:${ip}:${id.toLowerCase()}`, 8, 10 * 60_000)

  const { data: row, error } = await db()
    .from('users')
    .select('id, display_id, email, name, role, password')
    .ilike('display_id', escapeLike(id))
    .eq('role', body.role)
    .limit(1)
    .maybeSingle()
  if (error) throw error

  const { ok, legacy } = await verifyPassword(password, row?.password)
  if (!row || !ok) return NextResponse.json({ error: 'Incorrect ID or password. Check them and try again.' }, { status: 401 })

  if (legacy) {
    // Upgrade plaintext passwords to bcrypt on first successful sign-in.
    try { await db().from('users').update({ password: await hashPassword(password) }).eq('id', row.id) } catch { /* non-fatal */ }
  }

  const user: SessionUser = { id: String(row.id), display_id: row.display_id, email: row.email ?? '', name: row.name, role: row.role }
  await startSession(user)
  return NextResponse.json({ user })
})
