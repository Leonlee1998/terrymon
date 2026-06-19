import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

const STORE_ID = process.env.NEXT_PUBLIC_STORE_ID!

export async function GET() {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('store_booking_settings')
    .select('business_hours, shift_presets')
    .eq('store_id', STORE_ID)
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// PATCH /api/admin/settings
// Body: { businessHours?, shiftPresets? }
export async function PATCH(req: NextRequest) {
  const body = await req.json() as { businessHours?: object; shiftPresets?: object[] }
  const update: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (body.businessHours) update.business_hours = body.businessHours
  if (body.shiftPresets)  update.shift_presets  = body.shiftPresets

  const supabase = createAdminClient()
  const { error } = await supabase
    .from('store_booking_settings')
    .update(update)
    .eq('store_id', STORE_ID)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
