import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

const STORE_ID = process.env.NEXT_PUBLIC_STORE_ID!

// POST /api/pos/checkout
// 飼主在 Kiosk 結帳，呼叫 process_service_payment RPC + 寫通知
// Body: { memberId, petId, medicalRecordId, totalPrice, balanceUsed?, paymentMethod? }
export async function POST(req: NextRequest) {
  const {
    memberId,
    petId,
    medicalRecordId,
    totalPrice,
    balanceUsed = 0,
    paymentMethod = 'card',
  } = await req.json()

  if (!memberId || !totalPrice) {
    return NextResponse.json({ error: 'memberId and totalPrice required' }, { status: 400 })
  }

  const cardAmount = Number(totalPrice) - Number(balanceUsed)
  const supabase = createAdminClient()

  // Step 1: 呼叫 process_service_payment RPC（金流 + transactions + points_log）
  const { data: txId, error: txErr } = await supabase.rpc('process_service_payment', {
    p_member_id:      memberId,
    p_store_id:       STORE_ID,
    p_total_amount:   totalPrice,
    p_balance_to_use: balanceUsed,
    p_card_amount:    cardAmount,
    p_ref_type:       'medical_record',
    p_ref_id:         medicalRecordId ?? null,
  })

  if (txErr) return NextResponse.json({ error: txErr.message }, { status: 500 })

  // Step 2: UPDATE medical_records.transaction_id（若有 record ID）
  if (medicalRecordId) {
    await supabase
      .from('medical_records')
      .update({ transaction_id: txId })
      .eq('id', medicalRecordId)
  }

  // Step 3: INSERT notifications（看診完成）
  await supabase.from('notifications').insert({
    member_id:  memberId,
    type:       'service_complete',
    title:      '看診完成！',
    body:       `您的寵物已完成看診，診療費 NT$${totalPrice}。感謝您使用 TerryMon 服務！`,
    action_url: medicalRecordId ? `/vet/${medicalRecordId}` : '/vet',
  })

  return NextResponse.json({
    success:       true,
    receiptId:     txId,
    transactionId: txId,
    paymentMethod,
  })
}
