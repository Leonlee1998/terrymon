import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { z } from 'zod'

const schema = z.object({
  inventoryId: z.string().min(1),
  qty:         z.number().int().positive(),
})

// POST /api/pos/deduct-stock
// 售出商品，原子性扣減 pos_inventory.stock（不低於 0）
export async function POST(req: NextRequest) {
  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: '參數錯誤' }, { status: 400 })
  }

  const { inventoryId, qty } = parsed.data
  const supabase = createAdminClient()

  const { data: row, error: fetchErr } = await supabase
    .from('pos_inventory')
    .select('stock')
    .eq('id', inventoryId)
    .single()

  if (fetchErr || !row) return NextResponse.json({ error: '商品不存在' }, { status: 404 })
  if (row.stock < qty)  return NextResponse.json({ error: '庫存不足' },   { status: 409 })

  const { error } = await supabase
    .from('pos_inventory')
    .update({ stock: row.stock - qty })
    .eq('id', inventoryId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true, remainingStock: row.stock - qty })
}
