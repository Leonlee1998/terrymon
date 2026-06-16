import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

type Body = {
  name?: string
  type?: 'individual' | 'shelter' | 'rescue'
  description?: string
  phone?: string
  address?: string
  cert_url?: string
}

async function getMemberId(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data } = await supabase.from('members').select('id').eq('supabase_uid', user.id).single()
  return data ? String(data.id) : null
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const memberId = await getMemberId(supabase)
    if (!memberId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json() as Body
    const name = body.name?.trim()
    const type = body.type

    if (!name || !type || !['individual', 'shelter', 'rescue'].includes(type)) {
      return NextResponse.json({ error: 'name 和 type 為必填' }, { status: 400 })
    }

    const { data: existing } = await supabase
      .from('organizations')
      .select('id, status')
      .eq('member_id', memberId)
      .in('status', ['pending', 'approved'])
      .limit(1)
      .maybeSingle()

    if (existing) {
      return NextResponse.json({ error: '您已有待審核或已通過的申請' }, { status: 409 })
    }

    const { data, error } = await supabase
      .from('organizations')
      .insert({
        member_id: memberId,
        name,
        type,
        description: body.description?.trim() ?? '',
        phone: body.phone?.trim() || null,
        address: body.address?.trim() || null,
        cert_url: body.cert_url?.trim() || null,
      })
      .select('*')
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })

    return NextResponse.json({
      id: data.id,
      memberId: data.member_id,
      name: data.name,
      type: data.type,
      description: data.description,
      address: data.address ?? undefined,
      phone: data.phone ?? undefined,
      certUrl: data.cert_url ?? undefined,
      socialLinks: {},
      status: data.status,
      appliedAt: data.applied_at,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Application failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
