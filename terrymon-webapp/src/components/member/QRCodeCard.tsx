'use client'

import { useCallback, useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { Info, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import type { Member } from '@/types'

const createTimestamp = () => Date.now()

export default function QRCodeCard({ member }: { member: Member }) {
  const [timestamp, setTimestamp] = useState(createTimestamp)
  const qrValue = `TERRYMON-${member.id}-${timestamp}`

  const refresh = useCallback(() => {
    setTimestamp(createTimestamp())
    toast.success('QR Code 已更新')
  }, [])

  return (
    <div className="rounded-3xl border border-primary/25 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="font-bold text-ink">會員 QR Code</h3>
          <p className="mt-0.5 text-xs text-slate-t">到店掃描即可快速帶出會員資料</p>
        </div>
        <button
          type="button"
          onClick={refresh}
          className="flex items-center gap-1.5 rounded-xl border border-primary/30 px-3 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-primary-bg"
        >
          <RefreshCw size={12} />
          更新
        </button>
      </div>

      <div className="flex justify-center">
        <div className="rounded-2xl border border-border-t bg-white p-4 shadow-sm">
          <QRCodeSVG value={qrValue} size={160} fgColor="#2B7A4B" level="M" />
        </div>
      </div>

      <p className="mt-3 text-center font-mono text-xs text-slate-t">{member.id}</p>

      <div className="mt-3 flex items-start gap-2 rounded-2xl bg-primary-bg p-3">
        <Info size={14} className="mt-0.5 flex-shrink-0 text-primary" />
        <p className="text-xs leading-5 text-primary">
          QR Code 會依時間更新，若掃描失敗請按更新後再試一次。
        </p>
      </div>
    </div>
  )
}
