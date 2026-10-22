import { createHmac, timingSafeEqual } from 'node:crypto'
import { cookies } from 'next/headers'
import { SESSION_COOKIE, SESSION_MAX_AGE } from '../config'
import { Role, SessionUser } from '../types'
import { HttpError } from './http'

interface Payload extends SessionUser { exp: number }

function secret() {
  const s = process.env.SESSION_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!s) throw new HttpError(500, 'The server is not configured (set SESSION_SECRET).')
  return s
}
const sign = (body: string) => createHmac('sha256', secret()).update(body).digest('base64url')

export async function startSession(user: SessionUser) {
  const body = Buffer.from(JSON.stringify({ ...user, exp: Date.now() + SESSION_MAX_AGE * 1000 })).toString('base64url')
  const jar = await cookies()
  jar.set(SESSION_COOKIE, `${body}.${sign(body)}`, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SESSION_MAX_AGE,
  })
}

export async function endSession() {
  (await cookies()).delete(SESSION_COOKIE)
}

export async function getSession(): Promise<SessionUser | null> {
  const raw = (await cookies()).get(SESSION_COOKIE)?.value
  if (!raw) return null
  const [body, sig] = raw.split('.')
  if (!body || !sig) return null
  const expected = sign(body)
  if (sig.length !== expected.length || !timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null
  try {
    const p = JSON.parse(Buffer.from(body, 'base64url').toString()) as Payload
    if (p.exp < Date.now()) return null
    const { exp: _exp, ...user } = p // eslint-disable-line @typescript-eslint/no-unused-vars
    return user
  } catch {
    return null
  }
}

export async function requireRole(role: Role): Promise<SessionUser> {
  const s = await getSession()
  if (!s) throw new HttpError(401, 'Please sign in again.')
  if (s.role !== role) throw new HttpError(403, 'You do not have access to this.')
  return s
}
