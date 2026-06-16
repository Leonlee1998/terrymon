'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Plus, PawPrint, CalendarDays } from 'lucide-react'
import type { Organization, AdoptionTrackingPlan, Pet } from '@/types'
import AdoptionSetupDialog from './AdoptionSetupDialog'
import { Button } from '@/components/ui/button'

interface Props {
  org: Organization
  plans: AdoptionTrackingPlan[]
  pets: Pet[]
}

const STATUS_LABEL: Record<string, string> = {
  active: '追蹤中', completed: '已完成', cancelled: '已取消',
}
const STATUS_COLOR: Record<string, string> = {
  active: 'text-success bg-green-50', completed: 'text-slate-t bg-surface', cancelled: 'text-error bg-red-50',
}

export default function AdoptionManageClient({ org, plans, pets }: Props) {
  const [dialogOpen, setDialogOpen] = useState(false)

  return (
    <div className="flex min-h-screen flex-col pb-10">
      <div className="sticky top-0 z-10 border-b border-border-t bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-14 w-full max-w-2xl items-center gap-3 px-4">
          <Link href="/member" className="text-slate-t hover:text-ink">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="flex-1 font-bold text-ink">送養追蹤管理</h1>
          <Button
            size="sm"
            onClick={() => setDialogOpen(true)}
            className="gap-1.5 bg-primary text-white"
          >
            <Plus size={14} />
            新增
          </Button>
        </div>
      </div>

      <div className="mx-auto w-full max-w-2xl space-y-3 p-4">
        <div className="rounded-2xl border border-border-t bg-white px-4 py-3">
          <p className="text-sm font-medium text-ink">{org.name}</p>
          <p className="text-xs text-slate-t">{plans.length} 筆追蹤計畫</p>
        </div>

        {plans.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <PawPrint size={40} className="text-border-t" />
            <p className="font-medium text-slate-t">尚無送養追蹤計畫</p>
            <p className="text-sm text-slate-t">點擊「新增」建立第一筆送養追蹤</p>
          </div>
        ) : (
          plans.map(plan => (
            <div key={plan.id} className="rounded-2xl border border-border-t bg-white p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-bold text-ink">{plan.petName}</p>
                  <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-t">
                    <CalendarDays size={12} />
                    <span>回報月份：{plan.scheduleMonths.map(m => `第${m}月`).join('、')}</span>
                  </div>
                  <p className="mt-0.5 text-xs text-slate-t">
                    送養日：{plan.adoptionDate}
                  </p>
                </div>
                <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${STATUS_COLOR[plan.status] ?? ''}`}>
                  {STATUS_LABEL[plan.status] ?? plan.status}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      <AdoptionSetupDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        pets={pets}
      />
    </div>
  )
}
