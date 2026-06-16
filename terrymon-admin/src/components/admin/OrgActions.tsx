'use client'

import { useTransition } from 'react'
import { toast } from 'sonner'
import { setOrgStatus } from '@/services/adminActions'
import type { OrgStatus } from '@/types'

interface Props {
  orgId: string
  status: OrgStatus
}

export default function OrgActions({ orgId, status }: Props) {
  const [pending, startTransition] = useTransition()

  function act(next: OrgStatus) {
    startTransition(async () => {
      const res = await setOrgStatus(orgId, next)
      if (res.ok) toast.success(next === 'approved' ? '已核准' : '已停用')
      else toast.error(res.error ?? '操作失敗')
    })
  }

  return (
    <div className="flex justify-end gap-2">
      {status !== 'approved' && (
        <button
          onClick={() => act('approved')}
          disabled={pending}
          className="rounded-md bg-primary px-3 py-1 text-xs font-medium text-white hover:bg-primary-hover disabled:opacity-50"
        >
          核准
        </button>
      )}
      {status !== 'suspended' && (
        <button
          onClick={() => act('suspended')}
          disabled={pending}
          className="rounded-md border border-red-200 px-3 py-1 text-xs font-medium text-error hover:bg-red-50 disabled:opacity-50"
        >
          停用
        </button>
      )}
    </div>
  )
}
