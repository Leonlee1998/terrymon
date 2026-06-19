import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

// PATCH /api/admin/records/:id
// body: { notes: string }
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const { notes } = await req.json() as { notes?: string }
  if (notes === undefined) return NextResponse.json({ error: 'notes required' }, { status: 400 })

  const supabase = createAdminClient()
  const { error } = await supabase
    .from('grooming_records')
    .update({ notes })
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
