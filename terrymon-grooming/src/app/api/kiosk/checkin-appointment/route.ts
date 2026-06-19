import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

// POST /api/kiosk/checkin-appointment
// Body: { appointmentId }
// 飼主在 Kiosk 確認預約時，將預約狀態由 confirmed → checked_in
export async function POST(req: NextRequest) {
  const { appointmentId } = await req.json() as { appointmentId?: string }
  if (!appointmentId) return NextResponse.json({ error: 'appointmentId required' }, { status: 400 })

  const supabase = createAdminClient()
  const { error } = await supabase.rpc('checkin_appointment', { p_id: appointmentId })

  if (error) {
    if (error.message.includes('INVALID_STATE')) {
      return NextResponse.json({ error: '此預約無法報到（狀態不符）' }, { status: 400 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
