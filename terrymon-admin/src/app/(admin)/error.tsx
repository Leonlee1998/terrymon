'use client'
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[admin error]', error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <p className="mb-2 text-4xl">⚠️</p>
      <h2 className="mb-1 text-lg font-semibold text-ink">頁面載入失敗</h2>
      <p className="mb-6 text-sm text-slate-t">
        {error.message || '發生未知錯誤，請稍後再試'}
      </p>
      <Button onClick={reset}>重新載入</Button>
    </div>
  )
}
