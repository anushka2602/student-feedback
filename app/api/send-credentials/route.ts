import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
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
      subject: 'Your Login Credentials — Student Feedback System',
      html: `
        <!DOCTYPE html>
        <html>
        <body style="margin:0;padding:0;background:#FFF6F6;font-family:Arial,sans-serif">
          <div style="max-width:500px;margin:40px auto;background:white;border-radius:16px;padding:32px;box-shadow:0 4px 20px rgba(0,0,0,0.1)">
            <div style="background:#DB1A1A;color:white;padding:12px 20px;border-radius:8px;display:inline-block;margin-bottom:24px;font-size:13px;font-weight:bold;letter-spacing:2px;text-transform:uppercase">
              Feedback System
            </div>
            <h2 style="color:#2C687B;margin:0 0 8px 0;font-size:24px">Your Login Credentials</h2>
            <p style="color:#8CC7C4;margin:0 0 24px 0">Hello ${data.name}, here are your account details:</p>
            
            <div style="background:#FFF6F6;border-radius:12px;padding:20px;margin-bottom:24px">
              <table style="width:100%;border-collapse:collapse">
                <tr style="border-bottom:1px solid #e5e7eb">
                  <td style="padding:10px 0;color:#8CC7C4;font-size:13px;width:100px">Role</td>
                  <td style="padding:10px 0;color:#2C687B;font-weight:bold;text-transform:capitalize">${role}</td>
                </tr>
                <tr style="border-bottom:1px solid #e5e7eb">
                  <td style="padding:10px 0;color:#8CC7C4;font-size:13px">Your ID</td>
                  <td style="padding:10px 0;color:#DB1A1A;font-weight:bold;font-size:18px;letter-spacing:1px">${data.display_id}</td>
                </tr>
                <tr>
                  <td style="padding:10px 0;color:#8CC7C4;font-size:13px">Password</td>
                  <td style="padding:10px 0;color:#DB1A1A;font-weight:bold;font-size:18px;letter-spacing:1px">${data.password}</td>
                </tr>
              </table>
            </div>
            
            <p style="color:#8CC7C4;font-size:12px;margin:0">
              Please keep your credentials safe. You can change your password after logging in.
            </p>
          </div>
        </body>
        </html>
      `,
    })

    return NextResponse.json({ success: true })
  } catch (emailError) {
    console.error('Email error:', emailError)
    return NextResponse.json({ error: 'Failed to send email. Please contact your administrator.' }, { status: 500 })
  }
}