'use client'

import { useState } from 'react'
import { Building2, CheckCircle, Clock, XCircle, ChevronRight, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import type { Organization } from '@/types'
import OrgApplyDialog from './OrgApplyDialog'

const STATUS_CONFIG = {
  pending: {
    icon: Clock,
    label: '審核中',
    desc: '您的申請已送出，平台將於 3-5 個工作天內審核',
    color: 'text-warning',
    bg: 'bg-yellow-50 border-yellow-200',
  },
  approved: {
    icon: CheckCircle,
    label: '已通過',
    desc: '您的機構帳號已啟用',
    color: 'text-success',
    bg: 'bg-green-50 border-green-200',
  },
  suspended: {
    icon: XCircle,
    label: '已停用',
    desc: '帳號已被停用，請聯繫客服',
    color: 'text-error',
    bg: 'bg-red-50 border-red-200',
  },
}

const ORG_TYPE_LABEL: Record<string, string> = {
  individual: '個人中途',
  rescue: '救援團體',
  shelter: '收容所',
}

interface Props {
  initialOrg: Organization | null
}

export default function OrgApplicationSection({ initialOrg }: Props) {
  const [org, setOrg] = useState<Organization | null>(initialOrg)
  const [dialogOpen, setDialogOpen] = useState(false)

  if (!org) {
    return (
      <>
        <button
          onClick={() => setDialogOpen(true)}
          className="flex w-full items-center gap-3 rounded-2xl border border-border-t bg-white px-4 py-4 text-left transition-colors hover:bg-surface"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-bg text-primary">
            <Building2 size={20} />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-ink">申請成為機構 / 中途</p>
            <p className="text-xs text-slate-t">個人中途、救援團體、收容所</p>
          </div>
          <ChevronRight size={16} className="text-slate-t" />
        </button>
        <OrgApplyDialog open={dialogOpen} onOpenChange={setDialogOpen} onSuccess={setOrg} />
      </>
    )
  }

  const config = STATUS_CONFIG[org.status]
  const Icon = config.icon

  return (
    <div className={`rounded-2xl border p-4 ${config.bg}`}>
      <div className="flex items-start gap-3">
        <Icon size={20} className={`mt-0.5 shrink-0 ${config.color}`} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-bold text-ink">{org.name}</p>
            <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${config.color} bg-white/60`}>
              {config.label}
            </span>
          </div>
          <p className="text-xs text-slate-t">{ORG_TYPE_LABEL[org.type] ?? org.type}</p>
          <p className="mt-1 text-xs text-slate-t">{config.desc}</p>
        </div>
      </div>
      {org.status === 'approved' && (
        <Link
          href="/adoption"
          className="mt-3 flex items-center justify-between rounded-xl bg-white/70 px-3 py-2 text-sm font-medium text-primary hover:bg-white"
        >
          <span>管理送養追蹤</span>
          <ArrowRight size={14} />
        </Link>
      )}
    </div>
  )
}
