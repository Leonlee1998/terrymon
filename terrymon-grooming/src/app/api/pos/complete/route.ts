import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

const STORE_ID = process.env.NEXT_PUBLIC_STORE_ID!

// POST /api/pos/complete
// 完整的 6 步服務完成寫入（service_role）
// Body: { memberId, petId, mainServiceId, addonServiceIds, totalPrice,
//         balanceUsed?, signatureUrl, contractUrl?,
//         appointmentId?, groomerId?, paymentMethod? }
export async function POST(req: NextRequest) {
  const body = await req.json()
  const {
    memberId,
    petId,
    mainServiceId,
    addonServiceIds = [],
    totalPrice,
    balanceUsed = 0,
    signatureUrl,
    contractUrl,
    appointmentId,
    groomerId,
    paymentMethod = 'card',
  } = body

  if (!memberId || !petId || !totalPrice) {
    return NextResponse.json({ error: 'memberId, petId, totalPrice required' }, { status: 400 })
  }

  const cardAmount = Number(totalPrice) - Number(balanceUsed)
  const supabase = createAdminClient()

  // Resolve service names before writing record
  const serviceIds = [mainServiceId, ...addonServiceIds].filter(Boolean)
  const { data: svcRows } = await supabase
    .from('grooming_services')
    .select('id, name')
    .in('id', serviceIds)
  const svcMap = Object.fromEntries((svcRows ?? []).map((r: { id: string; name: string }) => [r.id, r.name]))
  const serviceNames = serviceIds.map(id => svcMap[id] ?? id)

  // Step 1: INSERT grooming_records
  const { data: record, error: recErr } = await supabase
    .from('grooming_records')
    .insert({
      member_id:        memberId,
      pet_id:           petId,
      store_id:         STORE_ID,
      appointment_id:   appointmentId ?? null,
      groomer_id:       groomerId ?? null,
      main_service_id:  mainServiceId ?? null,
      addon_service_ids: addonServiceIds,
      service_names:    serviceNames,
      total_price:      totalPrice,
      signature_url:    signatureUrl ?? null,
      contract_url:     contractUrl ?? null,
      signed_at:        new Date().toISOString(),
    })
    .select('id')
    .single()

  if (recErr) return NextResponse.json({ error: recErr.message }, { status: 500 })
  const recordId = record.id

  // Step 2: 呼叫 process_service_payment RPC（金流 + transactions + points_log）
  const { data: txId, error: txErr } = await supabase.rpc('process_service_payment', {
    p_member_id:      memberId,
    p_store_id:       STORE_ID,
    p_total_amount:   totalPrice,
    p_balance_to_use: balanceUsed,
    p_card_amount:    cardAmount,
    p_ref_type:       'grooming_record',
    p_ref_id:         recordId,
  })

  if (txErr) return NextResponse.json({ error: txErr.message }, { status: 500 })

  // Step 3: UPDATE grooming_records.transaction_id
  await supabase
    .from('grooming_records')
    .update({ transaction_id: txId })
    .eq('id', recordId)

  // Fetch pet name for document titles
  const { data: petRow } = await supabase.from('pets').select('name').eq('id', petId).maybeSingle()
  const displayPetName = petRow?.name ?? '寵物'
  const docDate = new Date().toLocaleDateString('zh-TW')

  // Step 4: INSERT documents（合約 + 收據）
  await supabase.from('documents').insert([
    {
      member_id:   memberId,
      pet_id:      petId,
      type:        'contract',
      title:       `${displayPetName}｜美容合約 ${docDate}`,
      url:         contractUrl ?? '#',
      source_type: 'grooming',
      source_id:   recordId,
      is_read:     false,
    },
    {
      member_id:   memberId,
      pet_id:      petId,
      type:        'receipt',
      title:       `${displayPetName}｜美容收據 ${docDate}`,
      url:         '#',
      source_type: 'grooming',
      source_id:   recordId,
      is_read:     false,
    },
  ])

  // Step 5: INSERT notifications（服務完成推播）
  await supabase.from('notifications').insert({
    member_id:  memberId,
    type:       'service_complete',
    title:      '美容服務完成！',
    body:       `${displayPetName} 已完成美容服務，消費 NT$${totalPrice}。感謝光臨 TerryMon！`,
    action_url: `/messages/grooming/${STORE_ID}`,
  })

  // Step 6: 若有預約，更新 appointments.status = 'completed'
  if (appointmentId) {
    await supabase
      .from('appointments')
      .update({ status: 'completed' })
      .eq('id', appointmentId)
  }

  return NextResponse.json({
    success:       true,
    documentId:    recordId,
    transactionId: txId,
    paymentMethod,
  })
}
