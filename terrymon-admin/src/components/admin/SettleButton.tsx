'use client'
import { useTransition } from 'react'
import { toast } from 'sonner'
import { settleTransaction } from '@/services/adminActions'
import { Button } from '@/components/ui/button'

export default function SettleButton({ txId }: { txId: string }) {
  const [pending, start] = useTransition()

  function settle() {
    start(async () => {
      const res = await settleTransaction(txId)
      if (res.ok) toast.success('已標記結算')
      else toast.error(res.error ?? '操作失敗')
    })
  }

  return (
    <Button size="sm" variant="outline" disabled={pending} onClick={settle}>
      {pending ? '…' : '標記結算'}
    </Button>
  )
}
