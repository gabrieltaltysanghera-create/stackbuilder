import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(request: NextRequest) {
  try {
    const { pdfBase64 } = await request.json()

    const message = await client.messages.create({
      model: 'claude-opus-4-5-20251101',
      max_tokens: 1500,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'document',
              source: {
                type: 'base64',
                media_type: 'application/pdf',
                data: pdfBase64,
              },
            },
            {
              type: 'text',
              text: 'You are an expert nutritionist analysing blood test results. Extract all relevant biomarkers from this blood test PDF. For each value found, state: the marker name, the result, the reference range, whether it is low/normal/high, and the specific supplement or lifestyle recommendation to address any deficiency or imbalance. Focus on: Vitamin D, B12, Iron, Ferritin, Magnesium, Zinc, Testosterone, TSH, Folate, Cortisol, Omega-3 Index, and any other relevant markers. Be specific and actionable. Format your response clearly with each marker on its own section. If this is not a blood test document, say so.',
            },
          ],
        },
      ],
    })

    const content = message.content[0]
    if (content.type !== 'text') throw new Error('Unexpected response')

    return NextResponse.json({ result: content.text })
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error'
    console.error('Bloodwork error:', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}