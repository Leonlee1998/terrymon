'use client'
import { useEffect, useState } from 'react'
import { MapPin, Clock, CheckCircle, XCircle, Store } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import type { GroomingStore, StorePlacement } from '@/types'

const STATUS_CONFIG = {
  pending:    { label: '審核中',   cls: 'bg-yellow-100 text-yellow-700', icon: Clock },
  approved:   { label: '已核准',   cls: 'bg-green-100 text-green-700',  icon: CheckCircle },
  rejected:   { label: '未通過',   cls: 'bg-red-100 text-red-700',     icon: XCircle },
  terminated: { label: '已終止',   cls: 'bg-gray-100 text-gray-600',   icon: XCircle },
}

export default function StorePlacementsPage() {
  const [placements, setPlacements] = useState<StorePlacement[]>([])
  const [stores, setStores] = useState<GroomingStore[]>([])
  const [applying, setApplying] = useState<string | null>(null)
  const [note, setNote] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    Promise.all([
      fetch('/api/store-placements').then(r => r.json()),
      fetch('/api/grooming-stores').then(r => r.json()),
    ]).then(([p, s]) => { setPlacements(p); setStores(s) })
  }, [])

  const appliedStoreIds = new Set(placements.map(p => p.storeId ?? (p as any).store_id))
  const available = stores.filter(s => !appliedStoreIds.has(s.id))

  async function handleApply(storeId: string) {
    setSubmitting(true)
    try {
      const res = await fetch('/api/store-placements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storeId, note }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      setPlacements(prev => [json, ...prev])
      setApplying(null)
      setNote('')
      toast.success('申請已送出，平台將盡快聯繫您')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : '申請失敗')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="p-6 max-w-3xl space-y-8">
      <h1 className="text-2xl font-black text-ink">實體進駐管理</h1>

      {/* 我的申請 */}
      <section>
        <h2 className="font-bold text-ink mb-3">我的申請</h2>
        {placements.length === 0 ? (
          <p className="text-slate-t text-sm">尚無申請記錄</p>
        ) : (
          <div className="bg-white rounded-2xl border border-border-t divide-y divide-border-t">
            {placements.map(p => {
              const cfg = STATUS_CONFIG[p.status]
              const Icon = cfg.icon
              const storeName = p.store?.name ?? '—'
              const city = p.store?.city ?? ''
              return (
                <div key={p.id} className="flex items-center justify-between px-5 py-4">
                  <div>
                    <p className="font-medium text-ink">{storeName}</p>
                    <p className="text-xs text-slate-t">{city}</p>
                    {p.adminNote && <p className="text-xs text-slate-t mt-1">平台備註：{p.adminNote}</p>}
                  </div>
                  <span className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${cfg.cls}`}>
                    <Icon size={11} /> {cfg.label}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* 可申請的店家 */}
      <section>
        <h2 className="font-bold text-ink mb-3">可申請的實體店</h2>
        {available.length === 0 ? (
          <p className="text-slate-t text-sm">已申請所有可進駐店家</p>
        ) : (
          <div className="space-y-3">
            {available.map(s => (
              <div key={s.id} className="bg-white rounded-2xl border border-border-t p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Store size={15} className="text-primary" />
                      <p className="font-medium text-ink">{s.name}</p>
                    </div>
                    <p className="text-xs text-slate-t flex items-center gap-1">
                      <MapPin size={11} /> {s.address}
                    </p>
                  </div>
                  {applying !== s.id && (
                    <Button size="sm" onClick={() => { setApplying(s.id); setNote('') }}
                      className="bg-primary hover:bg-primary-hover text-white shrink-0">
                      申請進駐
                    </Button>
                  )}
                </div>
                {applying === s.id && (
                  <div className="mt-4 space-y-3">
                    <Textarea
                      value={note} onChange={e => setNote(e.target.value)}
                      placeholder="請簡述品牌特色、預期上架商品，或其他想讓平台了解的事項..."
                      rows={3}
                    />
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => setApplying(null)}>取消</Button>
                      <Button size="sm" disabled={submitting}
                        onClick={() => handleApply(s.id)}
                        className="bg-primary hover:bg-primary-hover text-white">
                        {submitting ? '送出中...' : '確認送出'}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
