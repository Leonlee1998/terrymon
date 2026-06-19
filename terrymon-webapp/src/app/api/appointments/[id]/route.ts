import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

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

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: apptId } = await params
    const supabase = await createAuthedClient(request.headers.get('Authorization'))
    const memberId = await getMemberId(supabase)
    if (!memberId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (!apptId) return NextResponse.json({ error: '缺少預約 ID' }, { status: 400 })

    const { data: appt } = await supabase
      .from('appointments')
      .select('member_id, status')
      .eq('id', apptId)
      .single()

    if (!appt) return NextResponse.json({ error: '預約不存在' }, { status: 404 })
    if (String(appt.member_id) !== memberId)
      return NextResponse.json({ error: '無權操作此預約' }, { status: 403 })
    if (!['pending', 'confirmed'].includes(String(appt.status)))
      return NextResponse.json({ error: '此預約狀態不允許取消' }, { status: 400 })

    const body = await request.json().catch(() => ({})) as { reason?: string }

    const { data, error } = await supabase.rpc('cancel_appointment', {
      p_id:     apptId,
      p_reason: body.reason ?? null,
    })

    if (error) {
      const msg = error.message.includes('INVALID_STATE')
        ? '此預約狀態不允許取消'
        : error.message
      return NextResponse.json({ error: msg }, { status: 400 })
    }

    const result = data as { deposit_forfeited: boolean; amount: number }
    return NextResponse.json({
      depositForfeited: result.deposit_forfeited,
      amount:           result.amount,
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : '取消失敗'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
