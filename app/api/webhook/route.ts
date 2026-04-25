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
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error('Webhook signature error:', err)
    return NextResponse.json({ error: 'Webhook error' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    console.log('Checkout session completed:', session.id)
    console.log('Customer email:', session.customer_email)
    console.log('Customer:', session.customer)

    let email = session.customer_email

    if (!email && session.customer) {
      try {
        const customer = await stripe.customers.retrieve(session.customer as string)
        if (!customer.deleted && customer.email) {
          email = customer.email
        }
      } catch (err) {
        console.error('Error retrieving customer:', err)
      }
    }

    console.log('Resolved email:', email)

    if (email) {
      const { data: users } = await supabase.auth.admin.listUsers()
      const user = users?.users?.find(u => u.email === email)
      console.log('Found user:', user?.id)

      if (user) {
        const { error } = await supabase.from('subscribers').upsert({
          user_id: user.id,
          email: email,
          stripe_customer_id: session.customer as string,
        })
        console.log('Upsert error:', error)
      } else {
        console.log('No user found with email:', email)
      }
    } else {
      console.log('No email found in session')
    }
  }

  return NextResponse.json({ received: true })
}