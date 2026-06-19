import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

const STORE_ID = process.env.NEXT_PUBLIC_STORE_ID!

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q')?.trim()

  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('grooming_records')
    .select(`
      id, notes, created_at, service_names, total_price, contract_url, receipt_url,
      members(name, phone),
      pets(name, breed, weight, species),
      groomers(name),
      appointments(scheduled_date, scheduled_time),
      transactions(balance_used, card_amount, cash_amount)
    `)
    .eq('store_id', STORE_ID)
    .order('created_at', { ascending: false })
    .limit(60)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  type TxRow = { balance_used: number; card_amount: number; cash_amount: number } | null
  type ApptRow = { scheduled_date: string; scheduled_time: string | null } | null

  const records = (data ?? []).map(r => {
    const tx     = r.transactions as unknown as TxRow
    const appt   = r.appointments as unknown as ApptRow
    const member = r.members  as unknown as { name: string } | null
    const pet    = r.pets     as unknown as { name: string; breed: string; weight: number; species: string } | null
    const groomer = r.groomers as unknown as { name: string } | null

    let paymentMethod: 'card' | 'balance' | 'mixed' | 'cash' = 'card'
    if (tx) {
      if (tx.balance_used > 0 && tx.card_amount > 0) paymentMethod = 'mixed'
      else if (tx.balance_used > 0)                  paymentMethod = 'balance'
      else if (tx.cash_amount > 0)                   paymentMethod = 'cash'
    }

    return {
      id:            r.id,
      memberName:    member?.name  ?? '—',
      petName:       pet?.name     ?? '—',
      petBreed:      pet?.breed    ?? '—',
      petWeight:     pet?.weight   ?? 0,
      petSpecies:    pet?.species  ?? 'dog',
      groomerName:   groomer?.name ?? '—',
      date:          appt?.scheduled_date ?? r.created_at.slice(0, 10),
      startTime:     appt?.scheduled_time?.slice(0, 5) ?? '',
      services:      (r.service_names as string[]) ?? [],
      totalPrice:    r.total_price,
      paymentMethod,
      balanceUsed:   tx?.balance_used ?? 0,
      cardAmount:    tx?.card_amount  ?? 0,
      notes:         r.notes ?? '',
      contractUrl:   r.contract_url as string | null,
      receiptUrl:    r.receipt_url  as string | null,
    }
  })

  if (q) {
    const lower = q.toLowerCase()
    return NextResponse.json(records.filter(r =>
      r.memberName.toLowerCase().includes(lower)  ||
      r.petName.toLowerCase().includes(lower)     ||
      r.groomerName.toLowerCase().includes(lower)
    ))
  }

  return NextResponse.json(records)
}
