import { NextRequest, NextResponse } from 'next/server'

export class HttpError extends Error {
  constructor(public status: number, message: string) { super(message) }
}

type Handler = (req: NextRequest) => Promise<NextResponse | Response>

/** Wraps a route: same-origin check for writes, uniform JSON errors. */
export function route(handler: Handler): Handler {
  return async req => {
    try {
      if (req.method !== 'GET' && req.method !== 'HEAD') {
        const origin = req.headers.get('origin')
        if (origin && new URL(origin).host !== req.headers.get('host')) throw new HttpError(403, 'Cross-site request blocked.')
      }
      return await handler(req)
    } catch (e) {
      if (e instanceof HttpError) return NextResponse.json({ error: e.message }, { status: e.status })
      console.error('[api]', req.method, req.nextUrl.pathname, e)
      return NextResponse.json({ error: 'Something went wrong on our side. Please try again.' }, { status: 500 })
    }
  }
}

export async function readJson<T = Record<string, unknown>>(req: NextRequest): Promise<T> {
  try { return (await req.json()) as T } catch { throw new HttpError(400, 'Invalid request.') }
}

export const str = (v: unknown, max = 200) => (typeof v === 'string' ? v.trim().slice(0, max) : '')

export const clientIp = (req: NextRequest) =>
  req.headers.get('x-forwarded-for')?.split(',')[0].trim() || req.headers.get('x-real-ip') || 'local'

const hits = new Map<string, { count: number; reset: number }>()
/** Small in-memory limiter (per server instance). Throws 429 when exceeded. */
export function rateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now()
  if (hits.size > 5000) for (const [k, v] of hits) if (v.reset < now) hits.delete(k)
  const h = hits.get(key)
  if (!h || h.reset < now) { hits.set(key, { count: 1, reset: now + windowMs }); return }
  if (++h.count > limit) {
    const mins = Math.ceil((h.reset - now) / 60000)
    throw new HttpError(429, `Too many attempts. Try again in ${mins} minute${mins === 1 ? '' : 's'}.`)
  }
}

export const escapeLike = (s: string) => s.replace(/[\\%_]/g, m => '\\' + m)
