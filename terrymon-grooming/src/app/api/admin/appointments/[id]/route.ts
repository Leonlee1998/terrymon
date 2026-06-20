import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { sendStoreMessage } from '@/lib/messaging'

const STORE_ID = process.env.NEXT_PUBLIC_STORE_ID!

// PATCH /api/admin/appointments/:id
// body: { action: 'confirm' | 'reject' | 'start_service' | 'complete', groomerId?, durationMin?, reason? }
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const body = await req.json() as {
    action: 'confirm' | 'reject' | 'start_service' | 'complete'
    groomerId?: string
    durationMin?: number
    reason?: string
  }

  const supabase = createAdminClient()

  if (body.action === 'confirm') {
    const { error } = await supabase.rpc('confirm_appointment', {
      p_id:           id,
      p_groomer_id:   body.groomerId   ?? null,
      p_duration_min: body.durationMin ?? null,
    })
    if (error) {
      const msg = error.message.includes('INVALID_STATE') ? '此預約狀態無法確認' : error.message
      return NextResponse.json({ error: msg }, { status: 400 })
    }
    const { data: appt } = await supabase.from('appointments').select('member_id').eq('id', id).single()
    if (appt?.member_id) {
      await Promise.all([
        sendStoreMessage(appt.member_id, '✅ 您的預約已確認！期待您與毛孩的到來 🐾'),
        supabase.from('notifications').insert({
          member_id:  appt.member_id,
          type:       'appointment_confirmed',
          title:      '✅ 預約已確認',
          body:       '您的美容預約已確認，期待您與毛孩的到來！',
          action_url: `/messages/grooming/${STORE_ID}`,
          is_read:    false,
        }),
      ])
    }
  } else if (body.action === 'reject') {
    const { error } = await supabase.rpc('reject_appointment', {
      p_id:     id,
      p_reason: body.reason ?? null,
    })
    if (error) {
      const msg = error.message.includes('INVALID_STATE') ? '此預約狀態無法拒絕' : error.message
      return NextResponse.json({ error: msg }, { status: 400 })
    }
    const { data: appt } = await supabase.from('appointments').select('member_id').eq('id', id).single()
    if (appt?.member_id) {
      const reason = body.reason ? `（${body.reason}）` : ''
      await Promise.all([
        sendStoreMessage(appt.member_id, `很抱歉，您的預約申請未能接受${reason}。如有疑問請聯繫我們。`),
        supabase.from('notifications').insert({
          member_id:  appt.member_id,
          type:       'appointment_rejected',
          title:      '❌ 預約未能接受',
          body:       `您的美容預約申請未能接受${reason}。如有疑問請透過訊息聯繫我們。`,
          action_url: `/messages/grooming/${STORE_ID}`,
          is_read:    false,
        }),
      ])
    }
  } else if (body.action === 'start_service') {
    const { error } = await supabase.rpc('start_service_appointment', { p_id: id })
    if (error) {
      const msg = error.message.includes('INVALID_STATE') ? '此預約狀態無法開始服務' : error.message
      return NextResponse.json({ error: msg }, { status: 400 })
    }
  } else if (body.action === 'complete') {
    const { error } = await supabase
      .from('appointments')
      .update({ status: 'completed' })
      .eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  } else {
    return NextResponse.json({ error: '無效的 action' }, { status: 400 })
  }

  return NextResponse.json({ ok: true })
}
