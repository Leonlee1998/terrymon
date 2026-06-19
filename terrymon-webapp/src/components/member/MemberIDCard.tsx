'use client'

import { useCallback, useState } from 'react'
import { useRouter } from 'next/navigation'
import { QRCodeSVG } from 'qrcode.react'
import Barcode from 'react-barcode'
import { QrCode, Barcode as BarcodeIcon, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import type { Member } from '@/types'

type Mode = 'qr' | 'barcode'

export default function MemberIDCard({ member }: { member: Member }) {
  const router = useRouter()
  const [mode, setMode] = useState<Mode>('qr')
  const [ts, setTs]     = useState(() => Date.now())

  const qrValue      = `TERRYMON-${member.id}-${ts}`
  const barcodeValue = member.handle ? `TM-${member.handle}` : null
  const canBarcode   = !!barcodeValue

  const refresh = useCallback(() => {
    setTs(Date.now())
    toast.success('QR Code 已更新')
  }, [])

  function toggle() {
    if (!canBarcode && mode === 'qr') {
      router.push('/onboarding/handle')
      return
    }
    setMode(m => m === 'qr' ? 'barcode' : 'qr')
  }

  return (
    <div className="rounded-3xl border border-primary/25 bg-white p-5 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-bold text-ink">掃碼識別碼</h3>
          <p className="text-xs text-slate-t mt-0.5">到店掃描即可快速帶出資料</p>
        </div>
        {/* 右上角切換 */}
        <button
          onClick={toggle}
          className="p-2 rounded-xl bg-surface hover:bg-primary-bg text-primary transition-colors"
          title={mode === 'qr' ? '切換為條碼' : '切換為 QR Code'}
        >
          {mode === 'qr' ? <BarcodeIcon size={20} /> : <QrCode size={20} />}
        </button>
      </div>

      {/* 碼的區域 */}
      <div className="flex justify-center">
        {mode === 'qr' ? (
          <div className="rounded-2xl border border-border-t bg-white p-4 shadow-sm">
            <QRCodeSVG value={qrValue} size={160} fgColor="#f28c00" level="M" />
          </div>
        ) : canBarcode ? (
          <div className="rounded-2xl border border-border-t bg-white px-6 py-5 shadow-sm">
            <Barcode
              value={barcodeValue!}
              lineColor="#1A1D1A"
              background="#ffffff"
              width={2.2}
              height={100}
              displayValue={false}
              margin={0}
            />
          </div>
        ) : null}
      </div>

      {/* Handle */}
      <div className="mt-4 text-center">
        {member.handle ? (
          <p className="text-lg font-black text-ink tracking-wider">TM-{member.handle}</p>
        ) : (
          <p className="text-xs text-amber-600 bg-amber-50 rounded-xl px-3 py-2">
            尚未設定會員 ID，設定後可切換條碼掃描
          </p>
        )}
      </div>

      {/* 右下角更新（QR 模式才顯示） */}
      <div className="mt-3 flex justify-end">
        {mode === 'qr' && (
          <button
            onClick={refresh}
            className="flex items-center gap-1 text-[11px] text-slate-t hover:text-primary transition-colors"
          >
            <RefreshCw size={11} />
            更新 QR Code
          </button>
        )}
      </div>
    </div>
  )
}
