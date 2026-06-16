'use client'
import { useTransition } from 'react'
import { toast } from 'sonner'
import { setVendorStatus } from '@/services/adminActions'
import { Button } from '@/components/ui/button'
import type { VendorStatus } from '@/types'

export default function VendorActions({ vendorId, status }: { vendorId: string; status: VendorStatus }) {
  const [pending, start] = useTransition()

  function run(next: VendorStatus, label: string) {
    start(async () => {
      const res = await setVendorStatus(vendorId, next)
      if (res.ok) toast.success(`已${label}`)
      else toast.error(res.error ?? '操作失敗')
    })
  }

  return (
    <div className="flex justify-end gap-2">
      {status === 'pending' && (
        <>
          <Button size="sm" disabled={pending} onClick={() => run('approved', '核准')}>核准</Button>
          <Button size="sm" variant="outline" disabled={pending} onClick={() => run('suspended', '拒絕')}>拒絕</Button>
        </>
      )}
      {status === 'approved' && (
        <Button size="sm" variant="danger" disabled={pending} onClick={() => run('suspended', '停權')}>停權</Button>
      )}
      {status === 'suspended' && (
        <Button size="sm" disabled={pending} onClick={() => run('approved', '恢復')}>恢復</Button>
      )}
    </div>
  )
}
