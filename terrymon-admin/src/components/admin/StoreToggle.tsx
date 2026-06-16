'use client'
import { useTransition } from 'react'
import { toast } from 'sonner'
import { toggleStoreActive, setGroomingStoreStatus } from '@/services/adminActions'
import { Button } from '@/components/ui/button'

export default function StoreToggle({ id, kind, active }: {
  id: string; kind: 'store' | 'grooming'; active: boolean
}) {
  const [pending, start] = useTransition()

  function toggle() {
    start(async () => {
      const res = kind === 'store'
        ? await toggleStoreActive(id, !active)
        : await setGroomingStoreStatus(id, active ? 'inactive' : 'active')
      if (res.ok) toast.success(active ? '已停用' : '已啟用')
      else toast.error(res.error ?? '操作失敗')
    })
  }

  return (
    <Button size="sm" variant={active ? 'outline' : 'primary'} disabled={pending} onClick={toggle}>
      {active ? '停用' : '啟用'}
    </Button>
  )
}
