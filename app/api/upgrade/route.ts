import Stripe from 'stripe'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  try {
    const origin = request.nextUrl.origin
    const plan = request.nextUrl.searchParams.get('plan')
    const email = request.nextUrl.searchParams.get('email')

    const priceId = plan === 'yearly'
      ? process.env.STRIPE_YEARLY_PRICE_ID!
      : process.env.STRIPE_PRICE_ID!

    // Look up the Supabase user_id by email so we can pass it as metadata
    let userId: string | null = null
    if (email) {
      const { data } = await supabase.auth.admin.listUsers()
      const user = data?.users?.find(u => u.email === email)
      userId = user?.id ?? null
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      success_url: `${origin}/dashboard?upgraded=true`,
      cancel_url: `${origin}/dashboard`,
      ...(email && { customer_email: email }),
      metadata: {
        ...(userId && { supabase_user_id: userId }),
        ...(email && { email }),
      },
    })

    return NextResponse.redirect(session.url!)
  } catch (error) {
    console.error('Upgrade error:', error)
    return NextResponse.redirect(new URL('/dashboard', request.nextUrl.origin))
  }
}