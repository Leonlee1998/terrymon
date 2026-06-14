import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { z } from 'zod'

const schema = z.object({
  brandId: z.string().min(1),
  storeId: z.string().min(1),
  items: z.array(z.object({
    brandProductId: z.string().min(1),
    retailPrice:    z.number().positive(),
    memberPrice:    z.number().positive().optional(),
    stock:          z.number().int().min(0),
  })).min(1),
})

// POST /api/brand/push-inventory
// 品牌將商品推送至指定門市建立 pos_inventory（upsert）
export async function POST(req: NextRequest) {
  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: '參數錯誤', details: parsed.error.flatten() }, { status: 400 })
  }

  const { brandId, storeId, items } = parsed.data
  const supabase = createAdminClient()

  const { data: brand, error: brandErr } = await supabase
    .from('brands')
    .select('id, status')
    .eq('id', brandId)
    .eq('status', 'active')
    .maybeSingle()

  if (brandErr) return NextResponse.json({ error: brandErr.message }, { status: 500 })
  if (!brand)   return NextResponse.json({ error: '品牌不存在或尚未開通' }, { status: 400 })

  const rows = items.map(item => ({
    store_id:          storeId,
    brand_id:          brandId,
    brand_product_id:  item.brandProductId,
    retail_price:      item.retailPrice,
    member_price:      item.memberPrice ?? item.retailPrice,
    stock:             item.stock,
    is_active:         true,
    pushed_at:         new Date().toISOString(),
  }))

  const { error } = await supabase
    .from('pos_inventory')
    .upsert(rows, { onConflict: 'store_id,brand_product_id' })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true, count: rows.length })
}
