import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function generateShareId() {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < 10; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export async function POST(request: NextRequest) {
  try {
    const { stackId, userId } = await request.json()

    const { data: existing } = await supabase
      .from('stacks')
      .select('share_id, is_shared')
      .eq('id', stackId)
      .eq('user_id', userId)
      .single()

    if (!existing) {
      return NextResponse.json({ error: 'Stack not found' }, { status: 404 })
    }

    if (existing.share_id && existing.is_shared) {
      return NextResponse.json({ shareId: existing.share_id })
    }

    const shareId = generateShareId()

    await supabase
      .from('stacks')
      .update({ share_id: shareId, is_shared: true })
      .eq('id', stackId)
      .eq('user_id', userId)

    return NextResponse.json({ shareId })
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}