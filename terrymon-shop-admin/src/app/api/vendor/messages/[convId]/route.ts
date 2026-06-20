import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseClient, createAdminClient } from '@/lib/supabase/server'

async function getVendorId() {
  const session = await createSupabaseClient()
  const { data: { user } } = await session.auth.getUser()
  if (!user) return null
  const supabase = createAdminClient()
  const { data: vendor } = await supabase.from('vendors').select('id').eq('supabase_uid', user.id).single()
  return vendor?.id ?? null
}

// GET /api/vendor/messages/:convId — 載入訊息
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ convId: string }> },
) {
  const { convId } = await params
  const vendorId = await getVendorId()
  if (!vendorId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = createAdminClient()

  // 確認這個 conversation 屬於此 vendor
  const { data: conv } = await supabase
    .from('conversations').select('id').eq('id', convId).eq('ref_id', vendorId).maybeSingle()
  if (!conv) return NextResponse.json({ error: '對話不存在' }, { status: 404 })

  const { data, error } = await supabase
    .from('messages')
    .select('id, conversation_id, sender_id, sender_store_id, content_type, content, is_deleted, created_at')
    .eq('conversation_id', convId)
    .eq('is_deleted', false)
    .order('created_at', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data ?? [])
}

// POST /api/vendor/messages/:convId — 商家回覆訊息
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ convId: string }> },
) {
  const { convId } = await params
  const vendorId = await getVendorId()
  if (!vendorId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { content } = await req.json()
  if (!content?.trim()) return NextResponse.json({ error: '內容不可為空' }, { status: 400 })

  const supabase = createAdminClient()

  const { data: conv } = await supabase
    .from('conversations').select('id').eq('id', convId).eq('ref_id', vendorId).maybeSingle()
  if (!conv) return NextResponse.json({ error: '對話不存在' }, { status: 404 })

  const { data, error } = await supabase
    .from('messages')
    .insert({
      conversation_id: convId,
      sender_store_id: vendorId,
      content_type:    'text',
      content:         content.trim(),
      is_deleted:      false,
    })
    .select('id, conversation_id, sender_id, sender_store_id, content_type, content, is_deleted, created_at')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
