import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { z } from 'zod'

const upsertSchema = z.object({
  id:           z.string().optional(),
  name:         z.string().min(1),
  contactName:  z.string().optional(),
  contactPhone: z.string().optional(),
  contactEmail: z.string().email().optional().or(z.literal('')),
  status:       z.enum(['pending', 'active', 'suspended']).optional(),
})

const statusSchema = z.object({
  id:     z.string().min(1),
  status: z.enum(['pending', 'active', 'suspended']),
})

// POST /api/brand/manage — 新增或更新品牌
export async function POST(req: NextRequest) {
  const body = await req.json()
  const parsed = upsertSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: '參數錯誤' }, { status: 400 })

  const { id, name, contactName, contactPhone, contactEmail, status } = parsed.data
  const supabase = createAdminClient()
  const row = {
    name,
    contact_name:  contactName  ?? null,
    contact_phone: contactPhone ?? null,
    contact_email: contactEmail || null,
    status:        status ?? 'pending',
  }

  if (id) {
    const { error } = await supabase.from('brands').update(row).eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  }

  const { data, error } = await supabase.from('brands').insert(row).select('id').single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true, id: data.id })
}

// PATCH /api/brand/manage — 更新品牌狀態
export async function PATCH(req: NextRequest) {
  const body = await req.json()
  const parsed = statusSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: '參數錯誤' }, { status: 400 })

  const { id, status } = parsed.data
  const { error } = await createAdminClient().from('brands').update({ status }).eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
