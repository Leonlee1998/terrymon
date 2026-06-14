import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { z } from 'zod'

const schema = z.object({
  id:          z.string().min(1),
  retailPrice: z.number().positive().optional(),
  memberPrice: z.number().positive().optional(),
  stock:       z.number().int().min(0).optional(),
  isActive:    z.boolean().optional(),
})

// PATCH /api/pos/inventory
// 更新 pos_inventory 的售價、庫存、啟停狀態
export async function PATCH(req: NextRequest) {
  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: '參數錯誤' }, { status: 400 })
  }

  const { id, retailPrice, memberPrice, stock, isActive } = parsed.data
  const patch: Record<string, unknown> = {}
  if (retailPrice !== undefined) patch.retail_price = retailPrice
  if (memberPrice !== undefined) patch.member_price = memberPrice
  if (stock       !== undefined) patch.stock        = stock
  if (isActive    !== undefined) patch.is_active    = isActive

  if (!Object.keys(patch).length) {
    return NextResponse.json({ error: '至少需提供一個更新欄位' }, { status: 400 })
  }

  const { error } = await createAdminClient()
    .from('pos_inventory')
    .update(patch)
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
