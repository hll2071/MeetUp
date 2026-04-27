import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

// GET: 모든 유저의 availability 조회
export async function GET() {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('availability')
    .select('*, profiles(id, name, email)')
    .order('date')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // 날짜별로 그룹화
  const byDate: Record<string, { date: string; users: any[] }> = {}
  data?.forEach(row => {
    if (!byDate[row.date]) byDate[row.date] = { date: row.date, users: [] }
    if (row.profiles) byDate[row.date].users.push(row.profiles)
  })

  return NextResponse.json({ data: Object.values(byDate).sort((a, b) => a.date.localeCompare(b.date)) })
}

// POST: 날짜들 일괄 등록 (upsert)
export async function POST(req: Request) {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { dates }: { dates: string[] } = await req.json()
  if (!dates || !dates.length) return NextResponse.json({ error: 'dates required' }, { status: 400 })

  const rows = dates.map(date => ({ user_id: user.id, date }))
  const { error } = await supabase.from('availability').upsert(rows, { onConflict: 'user_id,date' })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}

// DELETE: 특정 날짜 삭제
export async function DELETE(req: Request) {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { date }: { date: string } = await req.json()
  const { error } = await supabase
    .from('availability')
    .delete()
    .eq('user_id', user.id)
    .eq('date', date)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
