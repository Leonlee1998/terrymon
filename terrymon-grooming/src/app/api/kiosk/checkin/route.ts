import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

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

  const { error } = await supabase.from('appointments').insert({
    member_id: memberId,
    pet_id: petId,
    store_id: STORE_ID,
    type: 'grooming',
    scheduled_date: today,
    scheduled_time: now,
    status: 'checked_in',
    source: 'kiosk',
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
