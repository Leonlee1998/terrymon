import { NextResponse } from 'next/server'
import { createSupabaseClient, createAdminClient } from '@/lib/supabase/server'

// GET /api/vendor/messages — 商家所有對話列表
export async function GET() {
  // 取得目前登入商家身份
  const session = await createSupabaseClient()
  const { data: { user } } = await session.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = createAdminClient()
  const { data: vendor } = await supabase.from('vendors').select('id').eq('supabase_uid', user.id).single()
  if (!vendor) return NextResponse.json({ error: 'Vendor not found' }, { status: 403 })

  const { data: convs, error } = await supabase
    .from('conversations')
    .select('id, created_at')
    .eq('ref_type', 'vendor')
    .eq('ref_id', vendor.id)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!convs?.length) return NextResponse.json([])

  const convIds = convs.map(c => c.id)

  type MemberInfo = { id: string; name: string; phone: string }

  const [{ data: members }, { data: lastMsgs }] = await Promise.all([
    supabase.from('conversation_members')
      .select('conversation_id, members!inner(id, name, phone)')
      .in('conversation_id', convIds),
    supabase.from('messages')
      .select('conversation_id, content, content_type, sender_id, created_at')
      .in('conversation_id', convIds)
      .eq('is_deleted', false)
      .order('created_at', { ascending: false }),
  ])

  const result = convs.map(conv => {
    const memberInfo = members?.find(m => m.conversation_id === conv.id)
    const lastMsg    = lastMsgs?.find(m => m.conversation_id === conv.id)
    const m = memberInfo?.members as unknown as MemberInfo | undefined

    return {
      id:           conv.id,
      member_id:    m?.id ?? null,
      member_name:  m?.name ?? '訪客',
      member_phone: m?.phone ?? '',
      last_content:      lastMsg?.content ?? null,
      last_content_type: lastMsg?.content_type ?? null,
      last_at:           lastMsg?.created_at ?? conv.created_at,
      has_unread: !!(lastMsg && !lastMsg.sender_id),
    }
  }).sort((a, b) => new Date(b.last_at).getTime() - new Date(a.last_at).getTime())

  return NextResponse.json(result)
}
