import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { sendStoreMessage } from '@/lib/messaging'

const STORE_ID = process.env.NEXT_PUBLIC_STORE_ID!

// POST /api/kiosk/checkin
// Body: { memberId, petId, weight }
export async function POST(req: NextRequest) {
  const { memberId, petId, weight } = await req.json()
  if (!memberId || !petId) {
    return NextResponse.json({ error: 'memberId and petId required' }, { status: 400 })
  }

  const supabase = createAdminClient()
  const today = new Date().toISOString().slice(0, 10)
  const now = new Date().toTimeString().slice(0, 8)

  if (weight > 0) {
    await supabase.from('pets').update({ weight }).eq('id', petId)
  }

  // 先找當日已預約（pending/confirmed）→ 升級為 checked_in；找不到才建新的
  const { data: existing } = await supabase
    .from('appointments')
    .select('id')
    .eq('member_id', memberId)
    .eq('pet_id', petId)
    .eq('store_id', STORE_ID)
    .eq('type', 'grooming')
    .eq('scheduled_date', today)
    .in('status', ['pending', 'confirmed'])
    .order('scheduled_time', { ascending: true })
    .limit(1)
    .maybeSingle()

  let appointmentId: string

  if (existing) {
    const { error } = await supabase
      .from('appointments')
      .update({ status: 'checked_in', scheduled_time: now })
      .eq('id', existing.id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    appointmentId = existing.id
  } else {
    const { data: appt, error } = await supabase
      .from('appointments')
      .insert({
        member_id:      memberId,
        pet_id:         petId,
        store_id:       STORE_ID,
        type:           'grooming',
        scheduled_date: today,
        scheduled_time: now,
        status:         'checked_in',
        source:         'kiosk',
      })
      .select('id')
      .single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    appointmentId = appt.id
  }

  // 發訊息通知會員已報到
  await sendStoreMessage(memberId, '🐾 已成功報到！請稍候，美容師即將為您的毛孩服務。')

  return NextResponse.json({ success: true, appointmentId })
}
