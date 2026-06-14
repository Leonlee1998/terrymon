'use client'

import { useState } from 'react'
import { Check, ChevronDown, ChevronUp, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { CaregiverPermissions, PetCaregiver } from '@/types'

const PERMISSIONS: { key: keyof CaregiverPermissions; label: string }[] = [
  { key: 'viewHealth',          label: '查看健康紀錄' },
  { key: 'viewAiot',            label: '查看 AIoT 設備' },
  { key: 'addHealth',           label: '新增健康數據' },
  { key: 'bookAppointment',     label: '幫忙預約看診/美容' },
  { key: 'receiveNotifications',label: '接收預約通知' },
]

export default function CaregiverCard({
  caregiver,
  onUpdatePermissions,
  onRemove,
}: {
  caregiver: PetCaregiver
  onUpdatePermissions: (p: CaregiverPermissions) => void
  onRemove: () => void
}) {
  const [expanded, setExpanded] = useState(false)
  const displayName = caregiver.memberName ?? caregiver.inviteContact ?? '未知'

  return (
    <div className="rounded-xl border border-border-t bg-white">
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-bg text-sm font-bold text-primary">
          {displayName.charAt(0)}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-ink">{displayName}</p>
          {caregiver.memberHandle && (
            <p className="text-xs text-slate-t">@{caregiver.memberHandle}</p>
          )}
        </div>
        <span className={cn(
          'shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold',
          caregiver.status === 'active' ? 'bg-primary-bg text-primary' : 'bg-amber-50 text-amber-600',
        )}>
          {caregiver.status === 'active' ? '已加入' : '待確認'}
        </span>
        <button onClick={() => setExpanded(e => !e)} className="shrink-0 p-1 text-slate-400">
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>

      {expanded && (
        <div className="space-y-2.5 border-t border-border-t px-4 pb-3 pt-3">
          <p className="mb-1 text-xs font-semibold text-slate-t">開放權限</p>
          {PERMISSIONS.map(({ key, label }) => {
            const active = caregiver.permissions[key]
            return (
              <button
                key={key}
                onClick={() => onUpdatePermissions({ ...caregiver.permissions, [key]: !active })}
                className="flex w-full items-center gap-2.5 text-left text-sm"
              >
                <span className={cn(
                  'flex h-4 w-4 shrink-0 items-center justify-center rounded border',
                  active ? 'border-primary bg-primary' : 'border-slate-300',
                )}>
                  {active && <Check size={10} className="text-white" strokeWidth={3} />}
                </span>
                <span className={active ? 'font-medium text-ink' : 'text-slate-t'}>{label}</span>
              </button>
            )
          })}
          <button
            onClick={onRemove}
            className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-lg border border-red-100 py-2 text-xs font-semibold text-red-400"
          >
            <Trash2 size={13} /> 移除此照護者
          </button>
        </div>
      )}
    </div>
  )
}
