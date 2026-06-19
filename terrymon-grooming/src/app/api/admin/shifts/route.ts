import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

const STORE_ID = process.env.NEXT_PUBLIC_STORE_ID!

// GET /api/admin/shifts?year=2026&month=6
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const year  = parseInt(searchParams.get('year')  ?? String(new Date().getFullYear()))
  const month = parseInt(searchParams.get('month') ?? String(new Date().getMonth() + 1))

  const from = `${year}-${String(month).padStart(2, '0')}-01`
  const lastDay = new Date(year, month, 0).getDate()
  const to = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('groomer_shifts')
    .select('id, groomer_id, work_date, start_time, end_time, is_day_off, note')
    .eq('store_id', STORE_ID)
    .gte('work_date', from)
    .lte('work_date', to)
    .order('work_date')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data ?? [])
}

// POST /api/admin/shifts — upsert one shift
// Body: { groomerId, workDate, startTime, endTime, isDayOff, note? }
export async function POST(req: NextRequest) {
  const { groomerId, workDate, startTime, endTime, isDayOff, note } = await req.json()
  if (!groomerId || !workDate) {
    return NextResponse.json({ error: 'groomerId and workDate required' }, { status: 400 })
  }

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('groomer_shifts')
    .upsert({
      groomer_id: groomerId,
      store_id:   STORE_ID,
      work_date:  workDate,
      start_time: isDayOff ? '09:00' : (startTime ?? '09:00'),
      end_time:   isDayOff ? '18:00' : (endTime ?? '18:00'),
      is_day_off: isDayOff ?? false,
      note:       note ?? null,
    }, { onConflict: 'groomer_id,work_date' })
    .select('id')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true, id: data.id })
}
