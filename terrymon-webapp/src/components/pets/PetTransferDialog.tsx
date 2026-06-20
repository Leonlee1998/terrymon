'use client'

import { useState } from 'react'
import { Search, X } from 'lucide-react'
import { toast } from 'sonner'
import { api } from '@/services/api'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import type { TransferType } from '@/types'

const TRANSFER_TYPES: { value: TransferType; label: string; desc: string }[] = [
  { value: 'foster',    label: '中途照顧', desc: '暫時委託照顧，預計接回' },
  { value: 'adoption',  label: '認養',     desc: '永久轉移，新主人全權負責' },
  { value: 'surrender', label: '轉讓',     desc: '無法繼續照顧，轉交他人' },
  { value: 'return',    label: '歸還',     desc: '中途期滿歸還原主或收容所' },
]

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  petId: string
  petName: string
  onSuccess: () => void
}

export default function PetTransferDialog({ open, onOpenChange, petId, petName, onSuccess }: Props) {
  const [query, setQuery] = useState('')
  const [searching, setSearching] = useState(false)
  const [found, setFound] = useState<{ id: string; name: string; handle?: string } | 'not-found' | null>(null)
  const [selected, setSelected] = useState<{ id: string; name: string } | null>(null)
  const [transferType, setTransferType] = useState<TransferType>('foster')
  const [reason, setReason] = useState('')
  const [saving, setSaving] = useState(false)

  function handleClose() {
    setQuery(''); setFound(null); setSelected(null)
    setTransferType('foster'); setReason('')
    onOpenChange(false)
  }

  async function handleSearch() {
    const q = query.trim()
    if (!q) return
    setSearching(true); setFound(null)
    try {
      const res = await api.searchMemberForInvite(q)
      setFound(res.found && res.member ? res.member : 'not-found')
    } catch {
      toast.error('搜尋失敗')
    } finally {
      setSearching(false) }
  }

  async function handleTransfer() {
    if (!selected) { toast.error('請選擇接收成員'); return }
    setSaving(true)
    try {
      await api.transferPet(petId, { toMemberId: selected.id, transferType, reason: reason.trim() || undefined })
      toast.success(`已將「${petName}」${TRANSFER_TYPES.find(t => t.value === transferType)?.label}給 ${selected.name}`)
      onSuccess()
      handleClose()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : '轉移失敗')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto rounded-2xl sm:max-w-md">
        <DialogHeader>
          <DialogTitle>轉移照顧權 — {petName}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* 轉移類型 */}
          <div>
            <p className="mb-2 text-sm font-medium text-ink">轉移類型</p>
            <div className="grid grid-cols-2 gap-2">
              {TRANSFER_TYPES.map(t => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setTransferType(t.value)}
                  className={`rounded-xl border p-3 text-left transition-colors ${
                    transferType === t.value
                      ? 'border-primary bg-primary-bg'
                      : 'border-border-t bg-white'
                  }`}
                >
                  <p className={`text-sm font-bold ${transferType === t.value ? 'text-primary' : 'text-ink'}`}>{t.label}</p>
                  <p className="mt-0.5 text-[11px] text-slate-t">{t.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* 搜尋接收人 */}
          <div>
            <p className="mb-2 text-sm font-medium text-ink">接收成員</p>
            {selected ? (
              <div className="flex items-center gap-2 rounded-xl border border-primary bg-primary-bg px-3 py-2.5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
                  {selected.name.charAt(0)}
                </div>
                <span className="flex-1 font-semibold text-primary">{selected.name}</span>
                <button type="button" onClick={() => setSelected(null)} className="text-primary/60 hover:text-primary">
                  <X size={15} />
                </button>
              </div>
            ) : (
              <>
                <div className="flex gap-2">
                  <input
                    placeholder="搜尋姓名 / @handle / Email"
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSearch()}
                    className="flex-1 rounded-xl border border-border-t px-3 py-2 text-sm outline-none focus:border-primary"
                  />
                  <button
                    type="button"
                    onClick={handleSearch}
                    disabled={searching || !query.trim()}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border-t bg-white text-slate-t hover:border-primary hover:text-primary disabled:opacity-40"
                  >
                    <Search size={15} />
                  </button>
                </div>
                {found && (
                  <div className="mt-2 rounded-xl border border-border-t bg-white p-3 text-sm">
                    {found === 'not-found' ? (
                      <p className="text-slate-t">找不到此會員，請確認對方已在 TerryMon 註冊</p>
                    ) : (
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-bg text-sm font-bold text-primary">
                          {found.name.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-ink">{found.name}</p>
                          {found.handle && <p className="text-xs text-slate-t">@{found.handle}</p>}
                        </div>
                        <button
                          type="button"
                          onClick={() => { setSelected(found as { id: string; name: string }); setFound(null); setQuery('') }}
                          className="rounded-lg bg-primary px-3 py-1 text-xs font-semibold text-white"
                        >
                          選擇
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>

          {/* 原因 */}
          <div>
            <p className="mb-1.5 text-sm font-medium text-ink">說明（選填）</p>
            <textarea
              value={reason}
              onChange={e => setReason(e.target.value)}
              rows={2}
              placeholder="例：出差一個月、永久認養、救援後送中途"
              className="w-full rounded-xl border border-border-t px-3 py-2 text-sm outline-none focus:border-primary"
            />
          </div>

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 rounded-xl border border-border-t py-2.5 text-sm text-slate-t"
            >
              取消
            </button>
            <button
              type="button"
              onClick={handleTransfer}
              disabled={saving || !selected}
              className="flex-1 rounded-xl bg-primary py-2.5 text-sm font-semibold text-white disabled:opacity-50"
            >
              {saving ? '處理中...' : '確認轉移'}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
