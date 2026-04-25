import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createClient } from '@supabase/supabase-js'

const resend = new Resend(process.env.RESEND_API_KEY)

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (authHeader !== 'Bearer ' + process.env.CRON_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const today = new Date().toISOString().split('T')[0]

    const { data: subscribers } = await supabase
      .from('subscribers')
      .select('user_id, email')

    if (!subscribers || subscribers.length === 0) {
      return NextResponse.json({ message: 'No subscribers' })
    }

    const { data: todayCheckins } = await supabase
      .from('checkins')
      .select('user_id')
      .eq('date', today)

    const checkedInIds = new Set((todayCheckins || []).map((c: {user_id: string}) => c.user_id))
    const usersNeedingReminder = subscribers.filter((s: {user_id: string; email: string}) => !checkedInIds.has(s.user_id))

    let sent = 0
    for (const user of usersNeedingReminder) {
      if (!user.email) continue
      await resend.emails.send({
        from: 'StackBuilder AI <onboarding@resend.dev>',
        to: user.email,
        subject: 'Time for your daily check-in',
        html: '<div style="font-family:sans-serif;max-width:500px;margin:0 auto;background:#000;color:#fff;padding:32px;border-radius:16px;"><h1 style="color:#4ade80;font-size:20px;margin-bottom:8px;">StackBuilder AI</h1><h2 style="font-size:24px;margin-bottom:12px;">Daily check-in reminder</h2><p style="color:#9CA3AF;margin-bottom:24px;">Your AI coach is ready to track your progress. A quick 60-second check-in helps your plan adapt.</p><a href="https://stackbuilder-sepia.vercel.app/checkin" style="display:inline-block;background:#4ade80;color:#000;font-weight:bold;padding:14px 28px;border-radius:12px;text-decoration:none;font-size:16px;">Complete check-in</a></div>',
      })
      sent++
    }

    return NextResponse.json({ message: 'Sent ' + sent + ' reminders' })
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}