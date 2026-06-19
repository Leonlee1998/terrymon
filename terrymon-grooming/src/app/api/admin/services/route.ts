import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

const STORE_ID = process.env.NEXT_PUBLIC_STORE_ID!

// GET /api/admin/services
export async function GET() {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('grooming_services')
    .select('id, name, price, duration, is_addon')
    .eq('store_id', STORE_ID)
    .eq('is_enabled', true)
    .order('is_addon')
    .order('sort_order')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data ?? [])
}
