import Stripe from 'stripe'
import { NextRequest, NextResponse } from 'next/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function GET(request: NextRequest) {
  try {
    const origin = request.nextUrl.origin
    const plan = request.nextUrl.searchParams.get('plan')
    const email = request.nextUrl.searchParams.get('email')
    const priceId = plan === 'yearly'
      ? process.env.STRIPE_YEARLY_PRICE_ID!
      : process.env.STRIPE_PRICE_ID!

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      success_url: `${origin}/dashboard?upgraded=true`,
      cancel_url: `${origin}/dashboard`,
      ...(email && { customer_email: email }),
    })

    return NextResponse.redirect(session.url!)
  } catch (error) {
    console.error('Upgrade error:', error)
    return NextResponse.redirect(new URL('/dashboard', request.nextUrl.origin))
  }
}