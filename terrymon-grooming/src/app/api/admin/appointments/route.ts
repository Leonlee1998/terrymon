import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

const STORE_ID = process.env.NEXT_PUBLIC_STORE_ID!

// POST /api/admin/appointments — 手動建立預約（電話預約）
export async function POST(req: NextRequest) {
  const body = await req.json() as {
    memberId: string
    petId: string
    serviceId: string
    addonIds?: string[]
    date: string
    time: string
    groomerId?: string
    notes?: string
  }

  if (!body.memberId || !body.petId || !body.serviceId || !body.date || !body.time) {
    return NextResponse.json({ error: '缺少必要欄位' }, { status: 400 })
  }

  const supabase = createAdminClient()

  const [{ data: svc }, { data: settings }] = await Promise.all([
    supabase.from('grooming_services').select('price, duration').eq('id', body.serviceId).single(),
    supabase.from('store_booking_settings').select('buffer_minutes, deposit_rate').eq('store_id', STORE_ID).single(),
  ])

  let addonPrice = 0
  if (body.addonIds?.length) {
    const { data: addons } = await supabase
      .from('grooming_services').select('price').in('id', body.addonIds)
    addonPrice = addons?.reduce((s: number, a: { price: number }) => s + a.price, 0) ?? 0
  }

  const duration = svc?.duration ?? 60
  const buffer = settings?.buffer_minutes ?? 15
  const estPrice = (svc?.price ?? 0) + addonPrice
  const deposit = Math.ceil(estPrice * Number(settings?.deposit_rate ?? 0.3))

  const [h, m] = body.time.split(':').map(Number)
  const endMin = h * 60 + m + duration + buffer
  const endTime = `${String(Math.floor(endMin / 60)).padStart(2, '0')}:${String(endMin % 60).padStart(2, '0')}`

  const { data, error } = await supabase
    .from('appointments')
    .insert({
      member_id: body.memberId,
      pet_id: body.petId,
      store_id: STORE_ID,
      type: 'grooming',
      source: 'phone',
      status: 'confirmed',
      scheduled_date: body.date,
      scheduled_time: body.time,
      end_time: endTime,
      duration_min: duration,
      groomer_id: body.groomerId ?? null,
      main_service_id: body.serviceId,
      addon_service_ids: body.addonIds ?? [],
      estimated_price: estPrice,
      deposit_amount: deposit,
      notes: body.notes ?? '電話預約',
      confirmed_at: new Date().toISOString(),
    })
    .select('id')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ id: data.id })
}

// GET /api/admin/appointments
//   ?date=YYYY-MM-DD          → 指定日期所有預約（預設今天）
//   ?year=2026&month=6        → 整月預約（月曆模式）
//   ?status=pending           → 全部待確認（跨日期）
//   ?status=checked_in        → 今日已報到
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const date   = searchParams.get('date')
  const status = searchParams.get('status')
  const year   = searchParams.get('year')
  const month  = searchParams.get('month')

  const supabase = createAdminClient()
  const today = new Date().toISOString().split('T')[0]

  let query = supabase
    .from('appointments')
    .select(`
      id, member_id, pet_id, status,
      scheduled_date, scheduled_time,
      groomer_id, main_service_id,
      estimated_price, photo_url, notes, cancel_reason,
      members!member_id(name, phone),
      pets!pet_id(name, breed, weight, allergies, species),
      groomers!groomer_id(name),
      grooming_services!main_service_id(name)
    `)
    .eq('store_id', STORE_ID)
    .neq('status', 'cancelled')
    .order('scheduled_date')
    .order('scheduled_time')

  if (year && month) {
    // 整月查詢
    const y = parseInt(year), m = parseInt(month)
    const from = `${y}-${String(m).padStart(2,'0')}-01`
    const to   = `${y}-${String(m).padStart(2,'0')}-${new Date(y, m, 0).getDate()}`
    query = query.gte('scheduled_date', from).lte('scheduled_date', to)
  } else if (status) {
    query = query.eq('status', status)
    if (status === 'checked_in' || status === 'in_service') {
      query = query.eq('scheduled_date', today)
    }
  } else {
    query = query.eq('scheduled_date', date ?? today)
  }

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json(data ?? [])
}
