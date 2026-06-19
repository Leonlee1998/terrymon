'use client'
import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { issueRefund } from '@/services/adminActions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { formatPrice } from '@/lib/utils'

interface Props {
  txId: string
  maxAmount: number
  memberName?: string
}

export default function RefundDialog({ txId, maxAmount, memberName }: Props) {
  const [open, setOpen] = useState(false)
  const [amount, setAmount] = useState(String(maxAmount))
  const [reason, setReason] = useState('')
  const [pending, start] = useTransition()

  function submit(e: React.FormEvent) {
    e.preventDefault()
    const amt = parseInt(amount, 10)
    if (isNaN(amt) || amt <= 0 || amt > maxAmount) {
      toast.error(`退款金額需介於 1 ~ ${maxAmount}`)
      return
    }
    start(async () => {
      const res = await issueRefund(txId, amt, reason)
      if (res.ok) {
        toast.success('退款成功，金額已退回會員餘額')
        setOpen(false)
      } else {
        toast.error(res.error ?? '退款失敗')
      }
    })
  }

  if (!open) {
    return (
      <Button size="sm" variant="outline" onClick={() => setOpen(true)}>退款</Button>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setOpen(false)}>
      <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl" onClick={e => e.stopPropagation()}>
        <h2 className="mb-1 text-base font-semibold text-ink">發起退款</h2>
        <p className="mb-4 text-sm text-slate-t">
          會員：{memberName ?? '—'}｜上限：{formatPrice(maxAmount)}
        </p>
        <form onSubmit={submit} className="flex flex-col gap-3">
          <div>
            <label className="mb-1 block text-xs text-slate-t">退款金額（元）</label>
            <Input
              type="number" min={1} max={maxAmount} step={1}
              value={amount} onChange={e => setAmount(e.target.value)} required
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-slate-t">退款原因</label>
            <Input
              value={reason} onChange={e => setReason(e.target.value)}
              placeholder="請填寫退款原因" required
            />
          </div>
          <div className="flex gap-2 pt-1">
            <Button type="submit" variant="danger" disabled={pending} className="flex-1">
              {pending ? '處理中…' : '確認退款'}
            </Button>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1">
              取消
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
