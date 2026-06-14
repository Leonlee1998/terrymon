'use client'

import { Lock } from 'lucide-react'
import { useRouter } from 'next/navigation'
import type { Member } from '@/types'
import { Button } from '@/components/ui/button'

export default function HandleCard({ member }: { member: Member }) {
  const router = useRouter()

  if (member.handle) {
    return (
      <div className="rounded-2xl border border-border-t bg-white p-4">
        <p className="mb-2 text-xs font-medium text-slate-t">會員 ID</p>
        <div className="flex items-center gap-2">
          <p className="text-lg font-black text-ink">TM-{member.handle}</p>
          <Lock size={14} className="text-slate-t" />
        </div>
        <p className="mt-1 text-[11px] text-slate-t">設定後永久不可修改，作為條碼報到的唯一識別碼</p>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-dashed border-red-200 bg-red-50 p-4">
      <p className="mb-1 text-xs font-medium text-red-500">尚未設定會員 ID</p>
      <p className="mb-3 text-sm text-slate-t">設定後可在店家掃描條碼報到</p>
      <Button
        size="sm"
        className="bg-primary text-white hover:bg-primary-hover"
        onClick={() => router.push('/onboarding/handle')}
      >
        立即設定
      </Button>
    </div>
  )
}
