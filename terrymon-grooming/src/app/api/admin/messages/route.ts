import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

const STORE_ID = process.env.NEXT_PUBLIC_STORE_ID!

// GET /api/admin/messages — 店家所有對話列表
export async function GET() {
  const supabase = createAdminClient()

  const { data: convs, error } = await supabase
    .from('conversations')
    .select('id, type, ref_type, ref_id, created_at')
    .eq('ref_id', STORE_ID)
    .eq('ref_type', 'store')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!convs?.length) return NextResponse.json([])

  const convIds = convs.map(c => c.id)

  // 取每個對話的 member 資訊
  const { data: members } = await supabase
    .from('conversation_members')
    .select('conversation_id, members!inner(id, name, phone)')
    .in('conversation_id', convIds)

  // 取每個對話的最後一則訊息
  const { data: lastMsgs } = await supabase
    .from('messages')
    .select('conversation_id, content, content_type, sender_id, created_at')
    .in('conversation_id', convIds)
    .eq('is_deleted', false)
    .order('created_at', { ascending: false })

  const result = convs.map(conv => {
    const memberInfo = members?.find(m => m.conversation_id === conv.id)
    const lastMsg    = lastMsgs?.find(m => m.conversation_id === conv.id)

    // 未讀：sender_id 有值（member 發的）的最新訊息
    const hasUnread = lastMsg && lastMsg.sender_id !== null

    return {
      id:           conv.id,
      member_id:    (memberInfo?.members as Record<string, string>)?.id ?? null,
      member_name:  (memberInfo?.members as Record<string, string>)?.name ?? '未知會員',
      member_phone: (memberInfo?.members as Record<string, string>)?.phone ?? '',
      last_content:      lastMsg?.content ?? null,
      last_content_type: lastMsg?.content_type ?? null,
      last_at:           lastMsg?.created_at ?? conv.created_at,
      has_unread:        hasUnread ?? false,
    }
  }).sort((a, b) => new Date(b.last_at).getTime() - new Date(a.last_at).getTime())

  return NextResponse.json(result)
}
