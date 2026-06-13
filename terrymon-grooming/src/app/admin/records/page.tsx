'use client'
import { useState } from 'react'
import { Search, Camera, Video, ExternalLink, Edit2 } from 'lucide-react'
import { MOCK_GROOMING_RECORDS } from '@/lib/mock'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import { formatPrice } from '@/lib/utils'
import { toast } from 'sonner'
import type { GroomingRecord, CCTVSession } from '@/types'

const STATUS_CONFIG = {
  'in-progress': { label: '進行中', className: 'bg-blue-100 text-blue-700 animate-pulse' },
  'completed':   { label: '已完成', className: 'bg-primary-bg text-primary' },
  'cancelled':   { label: '已取消', className: 'bg-gray-100 text-gray-500' },
}

export default function AdminRecords() {
  const [records, setRecords] = useState(MOCK_GROOMING_RECORDS)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedRecord, setSelectedRecord] = useState<GroomingRecord | null>(null)
  const [editNotes, setEditNotes] = useState('')
  const [showCCTV, setShowCCTV] = useState<CCTVSession | null>(null)

  const filtered = records.filter(r => {
    const matchSearch = r.memberName.includes(search) || r.petName.includes(search) || r.groomerName.includes(search)
    const matchStatus = statusFilter === 'all' || r.status === statusFilter
    return matchSearch && matchStatus
  })

  function handleSaveNotes() {
    if (!selectedRecord) return
    setRecords(prev => prev.map(r => r.id === selectedRecord.id ? { ...r, notes: editNotes } : r))
    toast.success('備注已儲存')
    setSelectedRecord(null)
  }

  function handleGenerateShareLink(cctv: CCTVSession) {
    const link = `https://app.terrymon.com/cctv/${cctv.shareToken}`
    navigator.clipboard.writeText(link).catch(() => {})
    toast.success('分享連結已複製！', { description: '飼主可透過此連結觀看影片，有效期 7 天' })
  }

  return (
    <div className="p-6">
      <AdminPageHeader title="服務紀錄" subtitle="查詢、修改服務紀錄與 CCTV 影像" />

      {/* Filters */}
      <div className="flex gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-t" />
          <Input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="搜尋飼主、寵物或美容師..." className="pl-9" />
        </div>
        {(['all', 'in-progress', 'completed', 'cancelled'] as const).map(s => (
          <button key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-4 py-2 rounded-xl text-sm font-medium border transition-colors flex-shrink-0 ${
              statusFilter === s ? 'bg-primary text-white border-primary' : 'border-border-t text-slate-t hover:border-primary'
            }`}>
            {{ all: '全部', 'in-progress': '進行中', completed: '已完成', cancelled: '已取消' }[s]}
          </button>
        ))}
      </div>

      {/* Records list */}
      <div className="space-y-3">
        {filtered.map(record => {
          const statusCfg = STATUS_CONFIG[record.status]
          const hasCctv = record.cctv.length > 0
          const liveSession = record.cctv.find(c => c.status === 'recording')

          return (
            <div key={record.id} className="bg-white rounded-2xl border border-border-t overflow-hidden">
              <div className="flex items-start gap-4 p-4">
                {/* Left: pet + member */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-bold text-ink">{record.petName}</p>
                    <span className="text-slate-t text-sm">·</span>
                    <p className="text-slate-t text-sm">{record.memberName}</p>
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ml-auto ${statusCfg.className}`}>
                      {statusCfg.label}
                    </span>
                  </div>
                  <p className="text-xs text-slate-t">{record.petBreed} · {record.petWeight} kg</p>
                  <p className="text-xs text-slate-t mt-1">
                    {record.date} {record.startTime}{record.endTime && `–${record.endTime}`}
                    {' · '}{record.groomerName}
                  </p>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {record.services.map(s => (
                      <span key={s} className="text-[11px] bg-primary-bg text-primary px-2 py-0.5 rounded-full">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Right: price + actions */}
                <div className="text-right flex-shrink-0">
                  <p className="font-black text-primary text-lg">{formatPrice(record.totalPrice)}</p>
                  <p className="text-xs text-slate-t">
                    {record.paymentMethod === 'balance' ? '儲值折抵' :
                     record.paymentMethod === 'card' ? '刷卡' : '混合付款'}
                  </p>
                  <div className="flex gap-2 mt-2 justify-end">
                    {hasCctv && (
                      <button
                        onClick={() => setShowCCTV(record.cctv[0])}
                        className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg border ${
                          liveSession
                            ? 'border-red-300 text-red-600 bg-red-50'
                            : 'border-border-t text-slate-t hover:border-primary hover:text-primary'
                        }`}>
                        {liveSession ? <><Camera size={12} className="animate-pulse" /> LIVE</> : <><Video size={12} /> 影片</>}
                      </button>
                    )}
                    <button
                      onClick={() => { setSelectedRecord(record); setEditNotes(record.notes) }}
                      className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg border border-border-t text-slate-t hover:border-primary hover:text-primary">
                      <Edit2 size={12} />
                      備注
                    </button>
                  </div>
                </div>
              </div>

              {/* Notes preview */}
              {record.notes && (
                <div className="px-4 pb-3">
                  <p className="text-xs text-slate-t bg-surface rounded-lg px-3 py-2">
                    💬 {record.notes}
                  </p>
                </div>
              )}
            </div>
          )
        })}

        {filtered.length === 0 && (
          <p className="text-center text-slate-t py-12 text-sm">查無符合的服務紀錄</p>
        )}
      </div>

      {/* Edit notes dialog */}
      <Dialog open={!!selectedRecord} onOpenChange={() => setSelectedRecord(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>編輯備注 — {selectedRecord?.petName}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="bg-surface rounded-xl p-3 text-sm">
              <p className="text-slate-t">{selectedRecord?.date} · {selectedRecord?.groomerName}</p>
              <p className="font-medium text-ink mt-1">{selectedRecord?.services.join('、')}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-ink">服務備注</label>
              <Textarea
                value={editNotes}
                onChange={e => setEditNotes(e.target.value)}
                rows={4}
                className="mt-1"
                placeholder="記錄特殊需求、毛況、客人要求等..."
              />
            </div>
            <Button onClick={handleSaveNotes} className="w-full bg-primary text-white">
              儲存備注
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* CCTV modal */}
      {showCCTV && (
        <Dialog open onOpenChange={() => setShowCCTV(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Camera size={18} className="text-primary" />
                {showCCTV.cameraName}
                {showCCTV.status === 'recording' && (
                  <span className="text-[11px] bg-red-500 text-white px-2 py-0.5 rounded-full font-bold ml-2 animate-pulse">
                    ● LIVE
                  </span>
                )}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              {/* Video area */}
              <div className="bg-gray-900 rounded-2xl aspect-video flex items-center justify-center relative overflow-hidden">
                {showCCTV.status === 'recording' ? (
                  <>
                    <div className="text-white/30 flex flex-col items-center gap-2">
                      <Camera size={40} />
                      <p>即時串流</p>
                      <p className="text-xs">（串接裝置 SDK 後啟用）</p>
                    </div>
                    <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                      LIVE · {showCCTV.cameraName}
                    </span>
                  </>
                ) : (
                  <>
                    <img
                      src={showCCTV.thumbnailUrl ?? 'https://placehold.co/640x360/1a1d1a/ffffff?text=VOD'}
                      alt="thumbnail"
                      className="w-full h-full object-cover opacity-40"
                    />
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                      <Video size={48} className="mb-2 opacity-60" />
                      <p className="font-medium">影片時長 {showCCTV.durationMin} 分鐘</p>
                      <p className="text-xs text-white/50 mt-1">
                        {showCCTV.startTime}–{showCCTV.endTime}
                      </p>
                    </div>
                  </>
                )}
              </div>

              {/* Actions */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleGenerateShareLink(showCCTV)}
                  className="flex items-center justify-center gap-2 border-2 border-primary text-primary rounded-xl py-3 text-sm font-medium hover:bg-primary-bg transition-colors">
                  <ExternalLink size={16} />
                  複製飼主分享連結
                </button>
                <button
                  onClick={() => toast.info('影片下載功能即將開放')}
                  className="flex items-center justify-center gap-2 border-2 border-border-t text-slate-t rounded-xl py-3 text-sm font-medium hover:border-ink hover:text-ink transition-colors">
                  <Video size={16} />
                  下載影片（業者留存）
                </button>
              </div>

              {/* Share info */}
              {showCCTV.shareToken && (
                <div className="bg-primary-bg rounded-xl p-3">
                  <p className="text-xs text-primary font-semibold mb-1">分享設定</p>
                  <p className="text-xs text-slate-t">
                    有效期限：{showCCTV.shareExpiry
                      ? new Date(showCCTV.shareExpiry).toLocaleDateString('zh-TW')
                      : '7 天'}
                  </p>
                  <p className="text-xs text-slate-t mt-0.5">
                    飼主點擊連結即可觀看，不需登入
                  </p>
                </div>
              )}

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                <p className="text-xs text-amber-700 font-semibold">📷 CCTV 系統說明</p>
                <p className="text-xs text-amber-700 mt-1">
                  現為 Mockup 示意。正式版將串接 AWS Kinesis Video Streams 或 Azure Media Services，
                  支援即時串流、雲端錄影及飼主授權觀看。
                </p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
