import { NextResponse } from 'next/server'
import { db } from '@/lib/server/db'
import { route } from '@/lib/server/http'
import { endSession, getSession } from '@/lib/server/session'

export const GET = route(async () => {
  const s = await getSession()
  if (!s) return NextResponse.json({ user: null })
  const { data } = await db().from('users').select('id').eq('id', s.id).maybeSingle()
  if (!data) { await endSession(); return NextResponse.json({ user: null }) }
  return NextResponse.json({ user: s })
})
