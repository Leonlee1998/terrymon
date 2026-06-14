import { createAdminClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const supabase = createAdminClient()

    const { data: { user }, error: authError } = await supabase.auth.admin.createUser({
      email: body.email,
      password: body.password,
      email_confirm: true,
    })
    if (authError) return NextResponse.json({ error: authError.message }, { status: 400 })

    const { error: vendorError } = await supabase.from('vendors').insert({
      supabase_uid: user!.id,
      store_name: body.storeName,
      owner_name: body.ownerName,
      email: body.email,
      phone: body.phone,
      tax_id: body.taxId || null,
      bank_account: body.bankAccount || null,
      description: body.description || null,
      status: 'pending',
    })

    if (vendorError) {
      await supabase.auth.admin.deleteUser(user!.id)
      return NextResponse.json({ error: vendorError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
