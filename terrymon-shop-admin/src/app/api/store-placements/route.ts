import { createAdminClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

const VENDOR_ID = process.env.NEXT_PUBLIC_VENDOR_ID!

export async function GET() {
  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('store_placements')
      .select('*, store:grooming_stores(id, name, city)')
      .eq('vendor_id', VENDOR_ID)
      .order('created_at', { ascending: false })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const { storeId, note } = await req.json()
    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from('store_placements')
      .insert({ vendor_id: VENDOR_ID, store_id: storeId, note: note || null })
      .select('*, store:grooming_stores(id, name, city)')
      .single()

    if (error) {
      const msg = error.code === '23505' ? '已申請過此店家' : error.message
      return NextResponse.json({ error: msg }, { status: 400 })
    }
    return NextResponse.json(data, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
