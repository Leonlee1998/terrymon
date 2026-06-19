'use client'
import { useState, useEffect, useCallback } from 'react'
import { Search, Camera, Video, ExternalLink, Edit2, RefreshCw } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import { formatPrice } from '@/lib/utils'
import { toast } from 'sonner'

type RecordRow = {
  id: string
  memberName: string
  petName: string
  petBreed: string
  petWeight: number
  groomerName: string
  date: string
  startTime: string
  services: string[]
  totalPrice: number
  paymentMethod: 'card' | 'balance' | 'mixed' | 'cash'
  balanceUsed: number
  cardAmount: number
  notes: string
  contractUrl: string | null
  receiptUrl:  string | null
}

const PAY_LABEL: Record<string, string> = {
  card: '刷卡', balance: '儲值折抵', mixed: '混合付款', cash: '現金',
}

export default function AdminRecords() {
  const [records, setRecords]   = useState<RecordRow[]>([])
  const [search,  setSearch]    = useState('')
  const [loading, setLoading]   = useState(true)
  const [selected, setSelected] = useState<RecordRow | null>(null)
  const [editNotes, setEditNotes] = useState('')
  const [saving, setSaving]     = useState(false)
  const [showCCTV, setShowCCTV] = useState<RecordRow | null>(null)

  const load = useCallback(async (q?: string) => {
    setLoading(true)
    try {
      const url = q ? `/api/admin/records?q=${encodeURIComponent(q)}` : '/api/admin/records'
      const res  = await fetch(url)
      const data = await res.json() as RecordRow[]
      setRecords(Array.isArray(data) ? data : [])
    } catch {
      toast.error('載入失敗')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { void load() }, [load])

  useEffect(() => {
    if (search.length === 0) { void load(); return }
    if (search.length < 2) return
    const t = setTimeout(() => void load(search), 400)
    return () => clearTimeout(t)
  }, [search, load])

  async function handleSaveNotes() {
    if (!selected) return
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/records/${selected.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: editNotes }),
      })
      if (!res.ok) throw new Error()
      setRecords(prev => prev.map(r => r.id === selected.id ? { ...r, notes: editNotes } : r))
      toast.success('備注已儲存')
      setSelected(null)
    } catch {
      toast.error('儲存失敗，請重試')
    } finally {
      setSaving(false)
    }
  }

  function handleCopyShareLink(record: RecordRow) {
    const link = `https://app.terrymon.com/cctv/${record.id}`
    navigator.clipboard.writeText(link).catch(() => {})
    toast.success('分享連結已複製！', { description: '飼主可透過此連結觀看影片，有效期 7 天' })
  }

  return (
    <div className="p-6">
      <AdminPageHeader
        title="服務紀錄"
        subtitle={`共 ${records.length} 筆${search ? '（搜尋結果）' : ''}`}
        action={
          <button onClick={() => void load(search || undefined)} className="p-2 rounded-xl hover:bg-surface text-slate-t">
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
        }
      />

      <div className="relative mb-6">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-t" />
        <Input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="搜尋飼主、寵物或美容師…" className="pl-9" />
      </div>

      {loading && records.length === 0 && (
        <p className="text-center text-slate-t py-12 text-sm">載入中…</p>
      )}

      <div className="space-y-3">
        {records.map(record => (
          <div key={record.id} className="bg-white rounded-2xl border border-border-t overflow-hidden">
            <div className="flex items-start gap-4 p-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-bold text-ink">{record.petName}</p>
                  <span className="text-slate-t text-sm">·</span>
                  <p className="text-slate-t text-sm">{record.memberName}</p>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full ml-auto bg-primary-bg text-primary">
                    已完成
                  </span>
                </div>
                <p className="text-xs text-slate-t">{record.petBreed} · {record.petWeight} kg</p>
                <p className="text-xs text-slate-t mt-1">
                  {record.date}{record.startTime && ` ${record.startTime}`}
                  {' · '}{record.groomerName}
                </p>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {record.services.map(s => (
                    <span key={s} className="text-[11px] bg-primary-bg text-primary px-2 py-0.5 rounded-full">{s}</span>
                  ))}
                </div>
              </div>

              <div className="text-right flex-shrink-0">
                <p className="font-black text-primary text-lg">{formatPrice(record.totalPrice)}</p>
                <p className="text-xs text-slate-t">{PAY_LABEL[record.paymentMethod] ?? record.paymentMethod}</p>
                <div className="flex gap-2 mt-2 justify-end">
                  <button
                    onClick={() => setShowCCTV(record)}
                    className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg border border-border-t text-slate-t hover:border-primary hover:text-primary">
                    <Video size={12} /> 影片
                  </button>
                  <button
                    onClick={() => { setSelected(record); setEditNotes(record.notes) }}
                    className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg border border-border-t text-slate-t hover:border-primary hover:text-primary">
                    <Edit2 size={12} /> 備注
                  </button>
                </div>
              </div>
            </div>

            {record.notes && (
              <div className="px-4 pb-3">
                <p className="text-xs text-slate-t bg-surface rounded-lg px-3 py-2">💬 {record.notes}</p>
              </div>
            )}
          </div>
        ))}

        {!loading && records.length === 0 && (
          <p className="text-center text-slate-t py-12 text-sm">
            {search ? '查無符合的服務紀錄' : '尚無服務紀錄'}
          </p>
        )}
      </div>

      {/* Edit notes dialog */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>編輯備注 — {selected?.petName}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="bg-surface rounded-xl p-3 text-sm">
              <p className="text-slate-t">{selected?.date} · {selected?.groomerName}</p>
              <p className="font-medium text-ink mt-1">{selected?.services.join('、')}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-ink">服務備注</label>
              <Textarea value={editNotes} onChange={e => setEditNotes(e.target.value)}
                rows={4} className="mt-1" placeholder="記錄特殊需求、毛況、客人要求等..." />
            </div>
            <Button onClick={handleSaveNotes} disabled={saving} className="w-full bg-primary text-white">
              {saving ? '儲存中…' : '儲存備注'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* CCTV placeholder */}
      {showCCTV && (
        <Dialog open onOpenChange={() => setShowCCTV(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Camera size={18} className="text-primary" />
                {showCCTV.petName} 的服務影像
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              <div className="bg-gray-900 rounded-2xl aspect-video flex items-center justify-center">
                <div className="text-white/30 flex flex-col items-center gap-2">
                  <Camera size={40} />
                  <p className="text-sm">影像串流</p>
                  <p className="text-xs">串接 CCTV 裝置後啟用</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleCopyShareLink(showCCTV)}
                  className="flex items-center justify-center gap-2 border-2 border-primary text-primary rounded-xl py-3 text-sm font-medium hover:bg-primary-bg transition-colors">
                  <ExternalLink size={16} /> 複製飼主分享連結
                </button>
                <button
                  onClick={() => toast.info('影片下載功能即將開放')}
                  className="flex items-center justify-center gap-2 border-2 border-border-t text-slate-t rounded-xl py-3 text-sm font-medium hover:border-ink hover:text-ink transition-colors">
                  <Video size={16} /> 下載影片
                </button>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                <p className="text-xs text-amber-700 font-semibold">📷 CCTV 系統說明</p>
                <p className="text-xs text-amber-700 mt-1">
                  現為功能預留。正式版將串接 AWS Kinesis Video Streams，支援即時串流、雲端錄影及飼主授權觀看。
                </p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
