import Stripe from 'stripe'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  const body = await request.text()
  const sig = request.headers.get('stripe-signature')!

  let event

  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    console.error('Webhook signature error:', err)
    return NextResponse.json({ error: 'Webhook error' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    console.log('Checkout session completed:', session.id)

    const userId = session.metadata?.supabase_user_id
    const email = session.metadata?.email || session.customer_email

    console.log('User ID from metadata:', userId)
    console.log('Email:', email)

    if (!userId || !email) {
      console.error('Missing userId or email in session metadata')
      return NextResponse.json({ received: true })
    }

    const { error } = await supabase.from('subscribers').upsert({
      user_id: userId,
      email: email,
      stripe_customer_id: session.customer as string,
    }, { onConflict: 'user_id' })

    if (error) {
      console.error('Supabase upsert error:', error)
    } else {
      console.log('Successfully subscribed user:', userId, email)
    }
  }

  return NextResponse.json({ received: true })
}