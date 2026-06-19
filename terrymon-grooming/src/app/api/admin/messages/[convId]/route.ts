import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

const STORE_ID = process.env.NEXT_PUBLIC_STORE_ID!

// GET /api/admin/messages/:convId — 取訊息列表
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ convId: string }> },
) {
  const { convId } = await params
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('messages')
    .select('id, conversation_id, sender_id, sender_store_id, content_type, content, is_deleted, created_at')
    .eq('conversation_id', convId)
    .eq('is_deleted', false)
    .order('created_at', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data ?? [])
}

// POST /api/admin/messages/:convId — 店家發送訊息
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ convId: string }> },
) {
  const { convId } = await params
  const { content } = await req.json()
  if (!content?.trim()) return NextResponse.json({ error: '內容不可為空' }, { status: 400 })

  const supabase = createAdminClient()

  // 確認這個 conversation 屬於此 store
  const { data: conv } = await supabase
    .from('conversations')
    .select('id')
    .eq('id', convId)
    .eq('ref_id', STORE_ID)
    .maybeSingle()

  if (!conv) return NextResponse.json({ error: '對話不存在' }, { status: 404 })

  const { data, error } = await supabase
    .from('messages')
    .insert({
      conversation_id: convId,
      sender_store_id: STORE_ID,
      content_type:    'text',
      content:         content.trim(),
      is_deleted:      false,
    })
    .select('id, conversation_id, sender_id, sender_store_id, content_type, content, is_deleted, created_at')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
