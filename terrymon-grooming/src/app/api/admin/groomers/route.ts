import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

const STORE_ID = process.env.NEXT_PUBLIC_STORE_ID!

// GET /api/admin/groomers
// 可帶 ?date=2026-06-19&time=10:00 → 只回傳當天當時段有排班且未請假的美容師
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const date = searchParams.get('date')
  const time = searchParams.get('time') // HH:MM

  const supabase = createAdminClient()
  const { data: groomers, error } = await supabase
    .from('groomers')
    .select('id, name, is_active')
    .eq('store_id', STORE_ID)
    .eq('is_active', true)
    .order('name')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!date) return NextResponse.json(groomers ?? [])

  // 取當天排班
  const { data: shifts } = await supabase
    .from('groomer_shifts')
    .select('groomer_id, start_time, end_time, is_day_off')
    .eq('store_id', STORE_ID)
    .eq('work_date', date)
    .in('groomer_id', (groomers ?? []).map(g => g.id))

  if (!shifts?.length) return NextResponse.json([])

  const available = (groomers ?? []).filter(g => {
    const shift = shifts.find(s => s.groomer_id === g.id)
    if (!shift || shift.is_day_off) return false
    if (!time) return true
    // 確認時間在排班區間內
    return time >= shift.start_time.slice(0, 5) && time < shift.end_time.slice(0, 5)
  })

  return NextResponse.json(available)
}
