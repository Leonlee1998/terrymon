import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

const STORE_ID = process.env.NEXT_PUBLIC_STORE_ID!

type DayTemplate = { startTime: string; endTime: string; isDayOff: boolean }
type WeekTemplate = Record<number, DayTemplate> // 0=Sun,1=Mon,...,6=Sat

// POST /api/admin/shifts/generate
// Body: { year, month, templates: { [groomerId]: WeekTemplate } }
// 只插入尚未存在的班次（不覆蓋已手動修改的）
export async function POST(req: NextRequest) {
  const { year, month, templates } = await req.json() as {
    year: number
    month: number
    templates: Record<string, WeekTemplate>
  }

  if (!year || !month || !templates) {
    return NextResponse.json({ error: 'year, month, templates required' }, { status: 400 })
  }

  const supabase = createAdminClient()
  const lastDay = new Date(year, month, 0).getDate()

  // 取得當月已有班次（不覆蓋）
  const from = `${year}-${String(month).padStart(2, '0')}-01`
  const to   = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`
  const { data: existing } = await supabase
    .from('groomer_shifts')
    .select('groomer_id, work_date')
    .eq('store_id', STORE_ID)
    .gte('work_date', from)
    .lte('work_date', to)

  const existingSet = new Set(
    (existing ?? []).map(r => `${r.groomer_id}|${r.work_date}`)
  )

  const rows: object[] = []
  for (const [groomerId, weekTpl] of Object.entries(templates)) {
    for (let day = 1; day <= lastDay; day++) {
      const date = new Date(year, month - 1, day)
      const dow  = date.getDay()
      const workDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
      if (existingSet.has(`${groomerId}|${workDate}`)) continue

      const tpl = weekTpl[dow]
      if (!tpl) continue
      rows.push({
        groomer_id: groomerId,
        store_id:   STORE_ID,
        work_date:  workDate,
        start_time: tpl.isDayOff ? '09:00' : tpl.startTime,
        end_time:   tpl.isDayOff ? '18:00' : tpl.endTime,
        is_day_off: tpl.isDayOff,
      })
    }
  }

  if (rows.length === 0) return NextResponse.json({ inserted: 0 })

  const { error } = await supabase.from('groomer_shifts').insert(rows)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ inserted: rows.length })
}
