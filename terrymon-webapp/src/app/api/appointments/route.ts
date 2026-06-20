import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { BookingInput } from '@/types'

async function createAuthedClient(authHeader: string | null) {
  const cookieStore = await cookies()
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      ...(token ? { global: { headers: { Authorization: `Bearer ${token}` } } } : {}),
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {}
        },
      },
    }
  )
}

async function getMemberId(supabase: Awaited<ReturnType<typeof createAuthedClient>>) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data: member } = await supabase
    .from('members').select('id').eq('supabase_uid', user.id).single()
  return member ? String(member.id) : null
}

export async function POST(request: Request) {
  try {
    const supabase = await createAuthedClient(request.headers.get('Authorization'))
    const memberId = await getMemberId(supabase)
    if (!memberId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json() as BookingInput
    const { petId, storeId, serviceId, addonIds, date, time, groomerId, notes, photoUrl } = body

    if (!petId || !storeId || !serviceId || !date || !time) {
      return NextResponse.json({ error: '必填欄位不完整' }, { status: 400 })
    }

    const { data, error } = await supabase.rpc('create_appointment', {
      p_member_id:  memberId,
      p_pet_id:     petId,
      p_store_id:   storeId,
      p_service_id: serviceId,
      p_addon_ids:  addonIds ?? [],
      p_date:       date,
      p_time:       time,
      p_groomer_id: groomerId ?? null,
      p_notes:      notes ?? '',
      p_photo_url:  photoUrl ?? null,
    })

    if (error) {
      const msg = error.message.includes('SLOT_CONFLICT')
        ? '此時段已被預約，請重新選擇'
        : error.message.includes('INVALID_SERVICE')
          ? '所選服務項目無效'
          : error.message
      return NextResponse.json({ error: msg }, { status: 400 })
    }

    // 預先建立對話室，確保店家確認預約時 sendStoreMessage 能找到對話
    void supabase.rpc('get_or_create_conversation', {
      p_type:     'grooming',
      p_ref_type: 'store',
      p_ref_id:   storeId,
    })

    return NextResponse.json({ id: data as string }, { status: 201 })
  } catch (err) {
    const msg = err instanceof Error ? err.message : '預約失敗'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
