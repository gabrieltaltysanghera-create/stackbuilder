import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { age, sex, weight, fitnessLevel, goals, muscleGroups, daysPerWeek, sessionLength, equipment, injuries, preferredStyle } = body

    const prompt = `You are an expert personal trainer and strength coach with deep knowledge of exercise science, periodisation, and evidence-based training methods.

A user has completed a workout intake form with the following information:
- Age: ${age}
- Biological sex: ${sex}
- Weight: ${weight}kg
- Fitness level: ${fitnessLevel}
- Goals: ${goals.join(', ')}
- Muscle groups to focus on: ${muscleGroups.join(', ')}
- Days per week: ${daysPerWeek}
- Session length: ${sessionLength}
- Equipment: ${equipment}
- Injuries or areas to avoid: ${injuries || 'None'}
- Preferred training style: ${preferredStyle}

Create a personalised weekly workout plan. For each training day provide 4-6 exercises with sets, reps, rest periods, starting weight guidance, and coaching notes. Include rest days. For each exercise provide a real PubMed study URL where possible.

Return your response as a JSON object in exactly this format:
{
  "summary": "2-3 sentence personalised summary of the overall training approach for this specific person",
  "weeklyPlan": [
    {
      "day": "Monday",
      "focus": "Push (Chest, Shoulders, Triceps)",
      "exercises": [
        {
          "name": "Barbell Bench Press",
          "sets": "4",
          "reps": "8-10",
          "weight": "Start at 60% of bodyweight",
          "rest": "90 sec",
          "notes": "Keep shoulder blades retracted throughout",
          "study": "https://pubmed.ncbi.nlm.nih.gov/XXXXXXXX or null"
        }
      ]
    }
  ],
  "tips": [
    "Progressive overload tip specific to this person",
    "Recovery tip based on their schedule",
    "Nutrition timing tip"
  ]
}

For rest days use this format:
{
  "day": "Wednesday",
  "focus": "Rest & Recovery",
  "exercises": []
}

Return only the JSON, no other text.`

    const message = await client.messages.create({
      model: 'claude-opus-4-5-20251101',
      max_tokens: 3000,
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

    const cleaned = content.text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const workoutData = JSON.parse(cleaned)
    return NextResponse.json(workoutData)

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('Workout generate error:', errorMessage)
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}