import { createAdminClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const supabase = createAdminClient()
    const vendorId = process.env.NEXT_PUBLIC_VENDOR_ID!

    const { data, error } = await supabase
      .from('products')
      .insert({
        vendor_id: vendorId,
        name: body.name,
        pet_species: body.petSpecies ?? 'all',
        category: body.category,
        subcategory: body.subcategory ?? null,
        price: body.price,
        original_price: body.originalPrice ?? null,
        cost: body.cost,
        stock: body.stock,
        image_url: 'https://placehold.co/300x300/FFF6E8/F28C00?text=Product',
        images: [],
        description: body.description,
        specs: {},
        tags: body.tags,
        status: body.status,
      })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
