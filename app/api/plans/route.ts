import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

// GET: 모든 약속 조회
export async function GET() {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('plans')
    .select('*, profiles(id, name, email)')
    .order('date')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

// POST: 약속 생성
export async function POST(req: Request) {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { date, time, place, activity, cost, memo } = body
  if (!date || !place) return NextResponse.json({ error: 'date and place required' }, { status: 400 })

  const { data, error } = await supabase
    .from('plans')
    .insert({ created_by: user.id, date, time: time || null, place, activity: activity || null, cost: cost || 0, memo: memo || null })
    .select('*, profiles(id, name, email)')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}
