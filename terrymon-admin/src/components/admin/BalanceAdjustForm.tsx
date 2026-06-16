'use client'
import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { adjustBalance } from '@/services/adminActions'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export default function BalanceAdjustForm({ memberId }: { memberId: string }) {
  const [target, setTarget] = useState<'balance' | 'points'>('balance')
  const [amount, setAmount] = useState('')
  const [reason, setReason] = useState('')
  const [pending, start] = useTransition()

  function submit(e: React.FormEvent) {
    e.preventDefault()
    const amt = parseInt(amount, 10)
    if (!Number.isInteger(amt) || amt === 0) { toast.error('請輸入非零整數（可為負）'); return }
    if (!reason.trim()) { toast.error('請填寫調整原因'); return }
    start(async () => {
      const res = await adjustBalance(memberId, target, amt, reason)
      if (res.ok) { toast.success('調整完成'); setAmount(''); setReason('') }
      else toast.error(res.error ?? '調整失敗')
    })
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <div className="flex gap-2">
        <select
          value={target}
          onChange={(e) => setTarget(e.target.value as 'balance' | 'points')}
          className="h-10 rounded-md border border-border-t bg-white px-3 text-sm"
        >
          <option value="balance">儲值餘額</option>
          <option value="points">回饋點數</option>
        </select>
        <Input
          type="number" placeholder="金額（負數為扣除）"
          value={amount} onChange={(e) => setAmount(e.target.value)}
        />
      </div>
      <Input placeholder="調整原因（必填，會記入稽核）" value={reason} onChange={(e) => setReason(e.target.value)} />
      <Button type="submit" disabled={pending}>{pending ? '處理中…' : '送出調整'}</Button>
    </form>
  )
}
