import { NextResponse } from 'next/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { createClient as createRouteClient } from '@/lib/supabase/server'

const HANDLE_RE = /^[a-z0-9][a-z0-9-]{2,18}[a-z0-9]$/

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim().replace(/^\uFEFF/, '')
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim().replace(/^\uFEFF/, '')
  if (!url || !key) throw new Error('Supabase not configured')
  return createAdminClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
}

export async function POST(request: Request) {
  try {
    const routeClient = await createRouteClient()
    const { data: userData } = await routeClient.auth.getUser()
    if (!userData.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { handle } = await request.json() as { handle?: string }
    const normalized = handle?.toLowerCase().trim() ?? ''

    if (!HANDLE_RE.test(normalized)) {
      return NextResponse.json({ error: '會員 ID 格式不正確' }, { status: 400 })
    }

    const admin = getAdminClient()
    const { data: member } = await admin
      .from('members')
      .select('id, handle')
      .eq('supabase_uid', userData.user.id)
      .single()

    if (!member) return NextResponse.json({ error: 'Member not found' }, { status: 404 })
    if (member.handle) return NextResponse.json({ error: '會員 ID 已設定，無法再次修改' }, { status: 409 })

    const { data: existing } = await admin
      .from('members')
      .select('id')
      .eq('handle', normalized)
      .maybeSingle()

    if (existing) return NextResponse.json({ error: '會員 ID 已被使用' }, { status: 409 })

    const { error } = await admin
      .from('members')
      .update({ handle: normalized })
      .eq('id', member.id)
      .is('handle', null)

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })

    return NextResponse.json({ handle: normalized })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
