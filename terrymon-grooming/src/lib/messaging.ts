import { createAdminClient } from '@/lib/supabase/server'

const STORE_ID = process.env.NEXT_PUBLIC_STORE_ID!

/**
 * 從店家發訊息到該會員的對話室
 * 僅在有對話存在時才發（walk-in 無 webapp 對話，直接略過）
 */
export async function sendStoreMessage(
  memberId: string,
  content: string,
  contentType: 'text' | 'appointment_update' = 'text',
) {
  try {
    const supabase = createAdminClient()

    // 找 member 與本店的 conversation
    const { data: convs } = await supabase
      .from('conversations')
      .select('id')
      .eq('ref_type', 'store')
      .eq('ref_id', STORE_ID)

    if (!convs?.length) return

    const { data: cm } = await supabase
      .from('conversation_members')
      .select('conversation_id')
      .eq('member_id', memberId)
      .in('conversation_id', convs.map(c => c.id))
      .maybeSingle()

    if (!cm?.conversation_id) return

    await supabase.from('messages').insert({
      conversation_id: cm.conversation_id,
      sender_store_id: STORE_ID,
      content_type:    contentType,
      content,
      is_deleted:      false,
    })
  } catch (err) {
    console.error('[sendStoreMessage]', err)
  }
}
