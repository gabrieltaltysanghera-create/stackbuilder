import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const { message, userId } = await request.json()

    const { data: checkins } = await supabase
      .from('checkins')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(7)

    const { data: stacks } = await supabase
      .from('stacks')
      .select('stack_data')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)

    const { data: workouts } = await supabase
      .from('workouts')
      .select('workout_data')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)

    const checkinSummary = checkins && checkins.length > 0
      ? checkins.map(c => `${c.date}: Energy ${c.energy}/10, Sleep ${c.sleep_quality}/10, Soreness ${c.soreness}/10, Mood ${c.mood}/10, Supplements: ${c.took_supplements ? 'yes' : 'no'}, Workout: ${c.completed_workout ? 'yes' : 'no'}${c.notes ? ', Notes: ' + c.notes : ''}`).join('\n')
      : 'No recent check-ins available'

    const currentStack = stacks && stacks[0]
      ? stacks[0].stack_data.supplements.map((s: {name: string; dose: string}) => `${s.name} - ${s.dose}`).join(', ')
      : 'No current supplement stack'

    const currentWorkout = workouts && workouts[0]
      ? workouts[0].workout_data.weeklyPlan.map((d: {day: string; focus: string}) => `${d.day}: ${d.focus}`).join(', ')
      : 'No current workout plan'

    const prompt = `You are an expert AI health coach. A user has sent you a message about how they are feeling or what has changed in their life. You have access to their recent check-in data, current supplement stack, and workout plan.

User message: "${message}"

Recent check-in data (last 7 days):
${checkinSummary}

Current supplement stack:
${currentStack}

Current workout plan:
${currentWorkout}

Based on the user's message and their recent data, provide specific, personalised advice on how they should adjust their supplement stack and/or workout plan. Be direct and practical. Give 3-5 specific recommendations. Reference their actual data where relevant. Keep your response concise and actionable - no more than 300 words.`

    const response = await client.messages.create({
      model: 'claude-opus-4-5-20251101',
      max_tokens: 600,
      messages: [{ role: 'user', content: prompt }],
    })

    const content = response.content[0]
    if (content.type !== 'text') throw new Error('Unexpected response type')

    return NextResponse.json({ response: content.text })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('Adapt error:', errorMessage)
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}