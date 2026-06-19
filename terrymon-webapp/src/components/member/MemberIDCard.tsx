'use client'

import { useCallback, useState } from 'react'
import { useRouter } from 'next/navigation'
import { QRCodeSVG } from 'qrcode.react'
import { Barcode, RefreshCw, ChevronRight } from 'lucide-react'
import { toast } from 'sonner'
import type { Member } from '@/types'

export default function MemberIDCard({ member }: { member: Member }) {
  const router = useRouter()
  const [ts, setTs] = useState(() => Date.now())

  const qrValue = `TERRYMON-${member.id}-${ts}`

  const refresh = useCallback(() => {
    setTs(Date.now())
    toast.success('QR Code 已更新')
  }, [])

  return (
    <div className="rounded-3xl border border-primary/25 bg-white p-5 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-bold text-ink">掃碼 / 會員識別碼</h3>
          <p className="text-xs text-slate-t mt-0.5">到店掃描即可快速帶出會員資料</p>
        </div>
        <button
          onClick={refresh}
          className="flex items-center gap-1.5 rounded-xl border border-primary/30 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary-bg transition-colors"
        >
          <RefreshCw size={12} />
          更新
        </button>
      </div>

      {/* QR Code */}
      <div className="flex justify-center">
        <div className="rounded-2xl border border-border-t bg-white p-4 shadow-sm">
          <QRCodeSVG value={qrValue} size={160} fgColor="#f28c00" level="M" />
        </div>
      </div>

      {/* Handle / ID */}
      <div className="mt-4 text-center">
        {member.handle ? (
          <>
            <p className="text-xl font-black text-ink tracking-wider">TM-{member.handle}</p>
            <p className="text-xs text-slate-t mt-0.5">會員識別碼（永久不可修改）</p>
          </>
        ) : (
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5 text-sm text-amber-700">
            尚未設定會員 ID，設定後可用條碼報到
          </div>
        )}
      </div>

      {/* 查看條碼 / 設定 ID */}
      <button
        onClick={() => member.handle ? router.push('/barcode') : router.push('/onboarding/handle')}
        className="mt-4 w-full flex items-center justify-between px-4 py-3 rounded-2xl bg-surface hover:bg-primary-bg transition-colors group"
      >
        <div className="flex items-center gap-2.5">
          <Barcode size={16} className="text-primary" />
          <span className="text-sm font-semibold text-ink">
            {member.handle ? '查看會員條碼' : '立即設定會員 ID'}
          </span>
        </div>
        <ChevronRight size={16} className="text-slate-t group-hover:text-primary transition-colors" />
      </button>
    </div>
  )
}
