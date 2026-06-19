import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

const STORE_ID = process.env.NEXT_PUBLIC_STORE_ID!

// GET /api/admin/members           → 最近 60 位會員
// GET /api/admin/members?q=關鍵字  → 姓名或手機搜尋
// GET /api/admin/members?phone=09XX → 單筆精確手機查詢（for CreateApptDialog）
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const phone = searchParams.get('phone')?.replace(/[\s-]/g, '')
  const q     = searchParams.get('q')?.trim()

  const supabase = createAdminClient()

  // Single phone lookup (for create appointment dialog)
  if (phone && phone.length >= 8) {
    const { data, error } = await supabase
      .from('members')
      .select('id, name, phone, pets(id, name, species, breed, weight, allergies)')
      .eq('phone', phone)
      .limit(1)
      .maybeSingle()
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json(data)
  }

  // Search or list
  let query = supabase
    .from('members')
    .select(`
      id, name, phone, email, platform_balance, points, tier, created_at,
      pets(id, name, species, breed, weight, allergies),
      appointments(id, scheduled_date, status)
    `)
    .eq('appointments.store_id', STORE_ID)
    .order('created_at', { ascending: false })
    .limit(60)

  if (q) {
    const digits = q.replace(/[\s-]/g, '')
    query = query.or(`name.ilike.%${q}%,phone.ilike.%${digits}%`)
  }

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data ?? [])
}
