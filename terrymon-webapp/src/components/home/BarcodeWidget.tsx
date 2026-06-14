'use client'

import { useRouter } from 'next/navigation'
import { Barcode, ChevronRight } from 'lucide-react'
import type { Member } from '@/types'

interface Props {
  member: Member
}

export default function BarcodeWidget({ member }: Props) {
  const router = useRouter()

  return (
    <button
      onClick={() => router.push('/barcode')}
      className="flex w-full items-center gap-4 rounded-2xl border border-border-t bg-white px-4 py-3.5 text-left shadow-sm transition-colors hover:border-card-teal hover:bg-card-teal-light active:scale-[0.98]"
    >
      {/* Icon */}
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-card-teal-light">
        <Barcode size={22} className="text-card-teal" />
      </div>

      {/* Text */}
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-slate-t">快速條碼報到</p>
        {member.handle ? (
          <p className="text-sm font-bold text-ink">TM-{member.handle}</p>
        ) : (
          <p className="text-sm font-medium text-red-400">尚未設定會員 ID</p>
        )}
      </div>

      {/* Arrow */}
      <ChevronRight size={18} className="shrink-0 text-slate-t" />
    </button>
  )
}
