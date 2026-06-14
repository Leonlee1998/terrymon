import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

const STORE_ID = process.env.NEXT_PUBLIC_STORE_ID!

// POST /api/pos/complete
// 醫師完成看診 — 依序：medical_records → payment RPC → appointment → documents → notifications
// Body: { memberId, petId, petName, memberName, appointmentId, result: ConsultationResult }
export async function POST(req: NextRequest) {
  const { memberId, petId, petName, appointmentId, result } = await req.json()
  if (!memberId || !petId || !result) {
    return NextResponse.json({ error: 'memberId, petId, result required' }, { status: 400 })
  }

  const supabase = createAdminClient()
  const displayPetName = petName ?? '寵物'

  // Step 1: INSERT medical_records
  const { data: record, error: recErr } = await supabase
    .from('medical_records')
    .insert({
      member_id:         memberId,
      pet_id:            petId,
      store_id:          STORE_ID,
      nxvet_record_id:   null,
      nxvet_synced_at:   null,
      clinic_name:       'TerryMon 聯盟動物醫院',
      doctor_name:       result.doctorName ?? 'Doctor',
      visit_date:        new Date().toISOString().slice(0, 10),
      chief_complaint:   result.chiefComplaint ?? '',
      diagnosis:         result.diagnosis ?? '',
      clinical_findings: result.clinicalFindings ?? null,
      treatment:         result.notes ?? null,
      prescriptions:     result.prescriptions ?? [],
      follow_up_date:    result.followUpDate ?? null,
      fee:               result.fee ?? null,
    })
    .select('id')
    .single()

  if (recErr) return NextResponse.json({ error: recErr.message }, { status: 500 })

  // Step 2: process_service_payment RPC（金流 + transactions + points_log）
  if ((result.fee ?? 0) > 0) {
    const { error: txErr } = await supabase.rpc('process_service_payment', {
      p_member_id:      memberId,
      p_store_id:       STORE_ID,
      p_total_amount:   result.fee,
      p_balance_to_use: 0,
      p_card_amount:    result.fee,
      p_ref_type:       'medical_record',
      p_ref_id:         record.id,
    })
    if (txErr) console.error('[vet:pos:complete] payment RPC error (non-blocking):', txErr)
  }

  // Step 3: UPDATE appointments.status = 'completed'
  if (appointmentId) {
    await supabase
      .from('appointments')
      .update({ status: 'completed' })
      .eq('id', appointmentId)
  }

  // Step 4: INSERT documents（藥單 + 收據）
  const docDate = new Date().toLocaleDateString('zh-TW')
  await supabase.from('documents').insert([
    {
      member_id:   memberId,
      pet_id:      petId,
      type:        'prescription',
      title:       `${displayPetName}｜藥單 ${docDate}`,
      url:         '#',
      source_type: 'vet',
      source_id:   record.id,
      is_read:     false,
    },
    {
      member_id:   memberId,
      pet_id:      petId,
      type:        'receipt',
      title:       `${displayPetName}｜診療收據 ${docDate}`,
      url:         '#',
      source_type: 'vet',
      source_id:   record.id,
      is_read:     false,
    },
  ])

  // Step 5: INSERT notifications
  await supabase.from('notifications').insert({
    member_id:  memberId,
    type:       'service_complete',
    title:      '看診完成，可前往取件',
    body:       `${displayPetName} 的看診已完成，請至 Kiosk 取件領取藥單。`,
    action_url: '/pets',
    is_read:    false,
  })

  if (result.followUpDate) {
    await supabase.from('notifications').insert({
      member_id:  memberId,
      type:       'appointment_reminder',
      title:      '回診日期已安排',
      body:       `${displayPetName} 的回診日期：${result.followUpDate}`,
      action_url: '/appointments',
      is_read:    false,
    })
  }

  return NextResponse.json({ success: true, medicalRecordId: record.id })
}
