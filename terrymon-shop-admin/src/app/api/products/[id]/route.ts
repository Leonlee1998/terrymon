import { createAdminClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

type Props = { params: Promise<{ id: string }> }

export async function PUT(req: Request, props: Props) {
  try {
    const { id } = await props.params
    const body = await req.json()
    const supabase = createAdminClient()
    const vendorId = process.env.NEXT_PUBLIC_VENDOR_ID!

    const { data, error } = await supabase
      .from('products')
      .update({
        name: body.name,
        pet_species: body.petSpecies ?? 'all',
        category: body.category,
        subcategory: body.subcategory ?? null,
        price: body.price,
        original_price: body.originalPrice ?? null,
        cost: body.cost,
        stock: body.stock,
        description: body.description,
        tags: body.tags,
        status: body.status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('vendor_id', vendorId)
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function PATCH(req: Request, props: Props) {
  try {
    const { id } = await props.params
    const body = await req.json()
    const supabase = createAdminClient()
    const vendorId = process.env.NEXT_PUBLIC_VENDOR_ID!

    const { data, error } = await supabase
      .from('products')
      .update({ status: body.status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('vendor_id', vendorId)
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function DELETE(_req: Request, props: Props) {
  try {
    const { id } = await props.params
    const supabase = createAdminClient()
    const vendorId = process.env.NEXT_PUBLIC_VENDOR_ID!

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id)
      .eq('vendor_id', vendorId)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
