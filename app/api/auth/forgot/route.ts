import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { db } from '@/lib/server/db'
import { clientIp, HttpError, rateLimit, readJson, route, str } from '@/lib/server/http'
import { hashPassword, tempPassword } from '@/lib/server/password'
import { isRole } from '@/lib/types'

const esc = (s: string) => s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!)
const GENERIC = 'If that email belongs to an account, we have sent a new temporary password. Check your spam folder too.'

export const POST = route(async req => {
  const body = await readJson(req)
  const email = str(body.email, 200).toLowerCase()
  if (!email || !isRole(body.role)) throw new HttpError(400, 'Enter your registered email address.')
  rateLimit(`forgot-ip:${clientIp(req)}`, 10, 60 * 60_000)
  rateLimit(`forgot:${email}`, 3, 60 * 60_000)

  if (!process.env.RESEND_API_KEY) throw new HttpError(500, 'Email is not set up on this server yet. Please contact your administrator.')

  const { data: user } = await db().from('users').select('id, display_id, name, password').eq('email', email).eq('role', body.role).maybeSingle()
  // Same response whether or not the account exists, so emails can't be probed.
  if (!user) return NextResponse.json({ message: GENERIC })

  const temp = tempPassword()
  const { error } = await db().from('users').update({ password: await hashPassword(temp) }).eq('id', user.id)
  if (error) throw error

  try {
    const { error: sendError } = await new Resend(process.env.RESEND_API_KEY).emails.send({
      from: process.env.EMAIL_FROM || 'Student Feedback <onboarding@resend.dev>',
      to: email,
      subject: 'Your temporary password',
      html: `<div style="font-family:system-ui,sans-serif;font-size:15px;line-height:1.6;color:#11202a">
        <p>Hello ${esc(user.name)},</p>
        <p>Use these details to sign in:</p>
        <p>ID: <b>${esc(user.display_id)}</b><br>Temporary password: <b style="font-family:monospace;font-size:17px">${esc(temp)}</b></p>
        <p>Please change your password right after signing in. If you didn't ask for this, tell your administrator.</p></div>`,
    })
    if (sendError) throw sendError
  } catch (e) {
    await db().from('users').update({ password: user.password }).eq('id', user.id) // put the old one back
    console.error('[forgot] email failed', e)
    throw new HttpError(500, 'We could not send the email. Please try again later.')
  }
  return NextResponse.json({ message: GENERIC })
})
