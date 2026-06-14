import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

const STORE_ID = process.env.NEXT_PUBLIC_STORE_ID!

// POST /api/pos/topup
// Body: { memberId, amount, cardLast4?, paymentMethod? }
export async function POST(req: NextRequest) {
  const { memberId, amount, cardLast4, paymentMethod = 'card' } = await req.json()
  if (!memberId || !amount) {
    return NextResponse.json({ error: 'memberId and amount required' }, { status: 400 })
  }

  const supabase = createAdminClient()

  const { data: txId, error } = await supabase.rpc('process_topup', {
    p_member_id:      memberId,
    p_store_id:       STORE_ID,
    p_amount:         Number(amount),
    p_payment_method: paymentMethod,
    p_card_last4:     cardLast4 ?? null,
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true, transactionId: txId })
}
