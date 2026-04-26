import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { age, sex, weight, goals, diet, sleep, sunlight, exercise, medications, budget } = body

    const prompt = `You are an expert nutritionist and supplement specialist with deep knowledge of the latest research from scientists like Andrew Huberman, Peter Attia, and peer-reviewed studies.

A user has completed an intake form with the following information:
- Age: ${age}
- Biological sex: ${sex}
- Weight: ${weight}kg
- Goals: ${goals.join(', ')}
- Diet type: ${diet}
- Average sleep: ${sleep} hours per night
- Daily sunlight exposure: ${sunlight}
- Exercise frequency: ${exercise}
- Current medications/supplements: ${medications || 'None'}
- Monthly budget: ${budget}

Based on this profile, create a personalised supplement stack. For each supplement provide:
1. The specific form (e.g. Magnesium Glycinate not just Magnesium)
2. Exact dose based on their weight and profile
3. Best timing for absorption
4. Why it is recommended for THIS specific person based on their data
5. Any warnings or interactions to be aware of
6. A real PubMed or peer-reviewed study URL that supports this recommendation

Return your response as a JSON object in exactly this format:
{
  "summary": "2-3 sentence personalised summary explaining the overall stack strategy for this specific person",
  "supplements": [
    {
      "name": "Supplement name and form",
      "dose": "Exact dose",
      "timing": "When to take it",
      "reason": "Why this person specifically needs this based on their profile",
      "warning": "Any warnings or null if none",
      "study": "A real PubMed URL like https://pubmed.ncbi.nlm.nih.gov/XXXXXXXX"
    }
  ]
}

Return only valid JSON. Do not include any explanation, markdown, or text outside the JSON object.`

    const message = await client.messages.create({
      model: 'claude-opus-4-5',
      max_tokens: 2000,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    })

    const content = message.content[0]
    if (content.type !== 'text') {
      throw new Error('Unexpected response type')
    }

    // Strip any markdown or extra text, extract just the JSON object
    const text = content.text.trim()
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('No JSON found in response')
    const stackData = JSON.parse(jsonMatch[0])
    return NextResponse.json(stackData)

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('Full error:', errorMessage)
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}