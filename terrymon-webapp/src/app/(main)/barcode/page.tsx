'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, QrCode, Barcode as BarcodeIcon, RefreshCw } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import Barcode from 'react-barcode'
import { useAuthStore } from '@/stores/authStore'

type Mode = 'qr' | 'barcode'

export default function BarcodePage() {
  const { member, isLoggedIn } = useAuthStore()
  const router = useRouter()
  const [mode, setMode] = useState<Mode>('qr')
  const [ts, setTs]     = useState(() => Date.now())

  const qrValue      = member ? `TERRYMON-${member.id}-${ts}` : ''
  const barcodeValue = member?.handle ? `TM-${member.handle}` : null

  // 保持螢幕常亮
  useEffect(() => {
    if (!('wakeLock' in navigator)) return
    let lock: WakeLockSentinel | null = null
    navigator.wakeLock.request('screen').then(l => { lock = l }).catch(() => {})
    return () => { lock?.release().catch(() => {}) }
  }, [])

  const refresh = useCallback(() => setTs(Date.now()), [])

  if (!isLoggedIn || !member) return null

  const canBarcode = !!barcodeValue

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white">
      {/* Header */}
      <div className="flex h-14 items-center px-4 border-b border-border-t">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-xl text-slate-400 hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>

        <h1 className="flex-1 text-center text-base font-bold text-ink">
          {mode === 'qr' ? '會員 QR Code' : '會員條碼'}
        </h1>

        {/* 右上角切換按鈕 */}
        <button
          onClick={() => setMode(m => m === 'qr' ? 'barcode' : 'qr')}
          disabled={mode === 'barcode' && !canBarcode}
          className="p-2 rounded-xl text-primary hover:bg-primary-bg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          title={mode === 'qr' ? '切換為條碼' : '切換為 QR Code'}
        >
          {mode === 'qr' ? <BarcodeIcon size={22} /> : <QrCode size={22} />}
        </button>
      </div>

      {/* 主體 */}
      <div className="flex flex-1 flex-col items-center justify-center gap-6 px-8">
        {/* 會員資訊 */}
        <div className="text-center">
          <p className="text-xl font-black text-ink">{member.name}</p>
          {member.handle && (
            <p className="text-sm font-semibold text-primary mt-0.5">TM-{member.handle}</p>
          )}
        </div>

        {/* 碼的區域 */}
        <div className="w-full flex justify-center">
          {mode === 'qr' ? (
            <div className="rounded-3xl border-2 border-primary/20 bg-white p-6 shadow-md">
              <QRCodeSVG
                value={qrValue}
                size={200}
                fgColor="#f28c00"
                level="M"
              />
            </div>
          ) : canBarcode ? (
            <div className="rounded-3xl border-2 border-primary/20 bg-white px-8 py-7 shadow-md">
              <Barcode
                value={barcodeValue!}
                lineColor="#1A1D1A"
                background="#ffffff"
                width={2.4}
                height={110}
                displayValue={false}
                margin={0}
              />
              <p className="mt-3 text-center text-base font-black tracking-widest text-ink">
                {barcodeValue}
              </p>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-border-t p-10 text-center text-sm text-slate-t">
              請先至<strong>會員中心</strong>設定你的會員 ID
            </div>
          )}
        </div>

        {/* 說明 + 刷新（QR 模式才有） */}
        <div className="flex flex-col items-center gap-3">
          {mode === 'qr' && (
            <button
              onClick={refresh}
              className="flex items-center gap-1.5 text-xs text-slate-t hover:text-primary transition-colors"
            >
              <RefreshCw size={12} />
              更新 QR Code
            </button>
          )}
          <p className="text-center text-xs text-slate-t">
            {mode === 'qr'
              ? '將 QR Code 對準掃描器，即可快速報到'
              : '將條碼對準掃描器，即可快速報到'}
          </p>
        </div>
      </div>

      {/* 底部 mode indicator */}
      <div className="pb-8 flex justify-center gap-2">
        <button onClick={() => setMode('qr')} className={`w-8 h-1.5 rounded-full transition-colors ${mode === 'qr' ? 'bg-primary' : 'bg-gray-200'}`} />
        <button onClick={() => setMode('barcode')} disabled={!canBarcode} className={`w-8 h-1.5 rounded-full transition-colors ${mode === 'barcode' ? 'bg-primary' : 'bg-gray-200'} disabled:opacity-30`} />
      </div>
    </div>
  )
}
