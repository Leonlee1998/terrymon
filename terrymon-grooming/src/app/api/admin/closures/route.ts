import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

const STORE_ID = process.env.NEXT_PUBLIC_STORE_ID!

// GET /api/admin/closures?year=2026&month=7
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const year  = parseInt(searchParams.get('year')  ?? String(new Date().getFullYear()))
  const month = parseInt(searchParams.get('month') ?? String(new Date().getMonth() + 1))
  const from  = `${year}-${String(month).padStart(2, '0')}-01`
  const to    = `${year}-${String(month).padStart(2, '0')}-${new Date(year, month, 0).getDate()}`

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('store_closures')
    .select('id, date, reason')
    .eq('store_id', STORE_ID)
    .gte('date', from)
    .lte('date', to)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data ?? [])
}

// POST /api/admin/closures — 新增店休
export async function POST(req: NextRequest) {
  const { date, reason } = await req.json() as { date: string; reason?: string }
  if (!date) return NextResponse.json({ error: 'date required' }, { status: 400 })

  const supabase = createAdminClient()
  const { error } = await supabase
    .from('store_closures')
    .upsert({ store_id: STORE_ID, date, reason: reason ?? null }, { onConflict: 'store_id,date' })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}

// DELETE /api/admin/closures?date=YYYY-MM-DD — 取消店休
export async function DELETE(req: NextRequest) {
  const date = new URL(req.url).searchParams.get('date')
  if (!date) return NextResponse.json({ error: 'date required' }, { status: 400 })

  const supabase = createAdminClient()
  const { error } = await supabase
    .from('store_closures')
    .delete()
    .eq('store_id', STORE_ID)
    .eq('date', date)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
