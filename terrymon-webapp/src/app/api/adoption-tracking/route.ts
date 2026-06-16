import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: '未登入' }, { status: 401 })

  const { data: member } = await supabase
    .from('members').select('id').eq('supabase_uid', user.id).single()
  if (!member) return NextResponse.json({ error: '找不到會員' }, { status: 401 })

  const { data: org } = await supabase
    .from('organizations').select('id, status')
    .eq('member_id', member.id).eq('status', 'approved')
    .maybeSingle()
  if (!org) return NextResponse.json({ error: '機構帳號未通過審核' }, { status: 403 })

  const body = await request.json() as {
    petId: string
    adopterMemberId: string
    adoptionDate: string
    scheduleMonths: number[]
    reportQuestions: string[]
  }

  if (!body.petId || !body.adopterMemberId || !body.scheduleMonths?.length) {
    return NextResponse.json({ error: '缺少必要欄位' }, { status: 400 })
  }

  const { data: plan, error: planErr } = await supabase
    .from('adoption_tracking_plans')
    .insert({
      organization_id: org.id,
      pet_id: body.petId,
      adopter_member_id: body.adopterMemberId,
      adoption_date: body.adoptionDate,
      schedule_months: body.scheduleMonths,
      report_questions: body.reportQuestions,
    })
    .select('id')
    .single()
  if (planErr) return NextResponse.json({ error: planErr.message }, { status: 500 })

  // 自動產生 checkpoint 記錄（遵循 migration 014 的 RPC）
  const { error: rpcErr } = await supabase.rpc('create_adoption_checkpoints', {
    p_plan_id: plan.id,
  })
  if (rpcErr) console.warn('[adoption-tracking] RPC error:', rpcErr.message)

  // 更新寵物送養狀態
  await supabase.from('pets').update({ adoption_status: 'adopted' }).eq('id', body.petId)

  // 通知認養人
  await supabase.from('notifications').insert({
    member_id: body.adopterMemberId,
    type: 'doc_received',
    title: '送養追蹤設定完成',
    body: '機構已建立送養追蹤計畫，記得按時回報近況！',
    is_read: false,
  })

  return NextResponse.json({ id: plan.id, success: true })
}
