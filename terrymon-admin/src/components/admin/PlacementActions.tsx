'use client'
import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { decidePlacement } from '@/services/adminActions'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import type { PlacementStatus } from '@/types'

export default function PlacementActions({ placement }: {
  placement: { id: string; status: PlacementStatus; listingFee: number; commissionRate: number }
}) {
  const [mode, setMode] = useState<'idle' | 'approving'>('idle')
  const [fee, setFee] = useState(String(placement.listingFee))
  const [rate, setRate] = useState(String(placement.commissionRate))
  const [pending, start] = useTransition()

  function decide(
    decision: 'approved' | 'rejected' | 'terminated',
    opts?: { listingFee?: number; commissionRate?: number }
  ) {
    start(async () => {
      const res = await decidePlacement(placement.id, decision, opts ?? {})
      if (res.ok) { toast.success('已更新進駐狀態'); setMode('idle') }
      else toast.error(res.error ?? '操作失敗')
    })
  }

  if (placement.status === 'approved') {
    return <Button size="sm" variant="danger" disabled={pending} onClick={() => decide('terminated')}>終止進駐</Button>
  }
  if (placement.status !== 'pending') {
    return <span className="text-xs text-slate-t">無可用操作</span>
  }

  if (mode === 'approving') {
    return (
      <div className="flex items-center justify-end gap-2">
        <Input className="h-8 w-24" type="number" value={fee} onChange={(e) => setFee(e.target.value)} placeholder="上架費" />
        <Input className="h-8 w-20" type="number" value={rate} onChange={(e) => setRate(e.target.value)} placeholder="抽成%" />
        <Button size="sm" disabled={pending}
          onClick={() => decide('approved', { listingFee: Number(fee), commissionRate: Number(rate) })}>
          確認
        </Button>
        <Button size="sm" variant="ghost" disabled={pending} onClick={() => setMode('idle')}>取消</Button>
      </div>
    )
  }

  return (
    <div className="flex justify-end gap-2">
      <Button size="sm" disabled={pending} onClick={() => setMode('approving')}>核准進駐</Button>
      <Button size="sm" variant="outline" disabled={pending} onClick={() => decide('rejected')}>拒絕</Button>
    </div>
  )
}
