import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { createClient } = await import('@supabase/supabase-js')
  const { Resend } = await import('resend')

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { email, role } = await req.json()

  if (!email || !role) {
    return NextResponse.json({ error: 'Email and role are required.' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('users')
    .select('display_id, password, name')
    .eq('email', email.toLowerCase())
    .eq('role', role)
    .single()

  if (error || !data) {
    return NextResponse.json({ error: 'No account found with that email for this role.' }, { status: 404 })
  }

  try {
    const resend = new Resend(process.env.RESEND_API_KEY!)
    await resend.emails.send({
      from: 'Student Feedback System <onboarding@resend.dev>',
      to: email,
      subject: 'Your Login Credentials',
      html: '<p>Hello ' + data.name + ', your ID is <b>' + data.display_id + '</b> and your password is <b>' + data.password + '</b></p>',
    })
    return NextResponse.json({ success: true })
  } catch (emailError) {
    console.error('Email error:', emailError)
    return NextResponse.json({ error: 'Failed to send email.' }, { status: 500 })
  }
}
