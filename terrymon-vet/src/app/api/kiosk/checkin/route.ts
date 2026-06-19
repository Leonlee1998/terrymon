import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

const STORE_ID = process.env.NEXT_PUBLIC_STORE_ID!

// POST /api/kiosk/checkin
// 掛號三步驟：appointments INSERT + health_data INSERT + pets.weight UPDATE
// Body: { memberId, petId, weight }
export async function POST(req: NextRequest) {
  const { memberId, petId, weight } = await req.json()
  if (!memberId || !petId) {
    return NextResponse.json({ error: 'memberId and petId required' }, { status: 400 })
  }

  const supabase = createAdminClient()
  const today = new Date().toISOString().slice(0, 10)
  const now = new Date().toTimeString().slice(0, 8)
  const weightNum = Number(weight ?? 0)

  // Step 1: 先找當日已預約（pending/confirmed）→ 升級為 checked_in；找不到才建新的
  const { data: existing } = await supabase
    .from('appointments')
    .select('id')
    .eq('member_id', memberId)
    .eq('pet_id', petId)
    .eq('store_id', STORE_ID)
    .eq('type', 'vet')
    .eq('scheduled_date', today)
    .in('status', ['pending', 'confirmed'])
    .order('scheduled_time', { ascending: true })
    .limit(1)
    .maybeSingle()

  let apptId: string

  if (existing) {
    const { error: upErr } = await supabase
      .from('appointments')
      .update({ status: 'checked_in', scheduled_time: now })
      .eq('id', existing.id)
    if (upErr) return NextResponse.json({ error: upErr.message }, { status: 500 })
    apptId = existing.id
  } else {
    const { data: appt, error: apptErr } = await supabase
      .from('appointments')
      .insert({
        member_id:      memberId,
        pet_id:         petId,
        store_id:       STORE_ID,
        type:           'vet',
        scheduled_date: today,
        scheduled_time: now,
        status:         'checked_in',
        source:         'kiosk',
      })
      .select('id')
      .single()
    if (apptErr) return NextResponse.json({ error: apptErr.message }, { status: 500 })
    apptId = appt.id
  }

  // Step 2: INSERT health_data（今日體重）
  if (weightNum > 0) {
    await supabase.from('health_data').insert({
      pet_id:      petId,
      metric:      'weight',
      value:       weightNum,
      unit:        'kg',
      recorded_at: new Date().toISOString(),
    })

    // Step 3: UPDATE pets.weight（最新體重）
    await supabase.from('pets').update({ weight: weightNum }).eq('id', petId)
  }

  return NextResponse.json({ success: true, appointmentId: apptId })
}
