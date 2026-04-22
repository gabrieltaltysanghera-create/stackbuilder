import Stripe from 'stripe'
import { NextRequest, NextResponse } from 'next/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function GET(request: NextRequest) {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID!,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${request.headers.get('origin')}/intake?upgraded=true`,
      cancel_url: `${request.headers.get('origin')}/intake`,
    })

    return NextResponse.redirect(session.url!)
  } catch (error) {
    console.error('Upgrade error:', error)
    return NextResponse.redirect(new URL('/intake', request.url))
  }
}