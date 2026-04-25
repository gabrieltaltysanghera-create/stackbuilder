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
    const priceId = plan === 'yearly'
      ? process.env.STRIPE_YEARLY_PRICE_ID!
      : process.env.STRIPE_PRICE_ID!

    const { data: { user } } = await supabase.auth.getUser()
    const customerEmail = user?.email

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      success_url: `${origin}/intake?upgraded=true`,
      cancel_url: `${origin}/intake`,
      customer_creation: 'always',
      ...(customerEmail && { customer_email: customerEmail }),
    })

    return NextResponse.redirect(session.url!)
  } catch (error) {
    console.error('Upgrade error:', error)
    return NextResponse.redirect(new URL('/intake', request.nextUrl.origin))
  }
}