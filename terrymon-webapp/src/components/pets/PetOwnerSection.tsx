'use client'

import { useEffect, useState } from 'react'
import { ArrowRightLeft, Crown, Heart, History } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { api } from '@/services/api'
import PetTransferDialog from './PetTransferDialog'
import type { Pet, PetTransfer } from '@/types'

const TRANSFER_LABEL: Record<string, string> = {
  foster: '中途照顧', adoption: '認養', surrender: '轉讓', return: '歸還',
}

interface Props {
  pet: Pet
  onTransferSuccess: () => void
}

export default function PetOwnerSection({ pet, onTransferSuccess }: Props) {
  const { member } = useAuthStore()
  const [transfers, setTransfers] = useState<PetTransfer[]>([])
  const [transferOpen, setTransferOpen] = useState(false)
  const [historyOpen, setHistoryOpen] = useState(false)

  useEffect(() => {
    api.getPetTransfers(pet.id).then(setTransfers).catch(() => {})
  }, [pet.id])

  const isOwner = member?.id === pet.memberId
  const isCurrentCaregiver = member?.id === (pet.primaryCaregiverId ?? pet.memberId)
  const hasCaregiver = pet.primaryCaregiverId && pet.primaryCaregiverId !== pet.memberId

  return (
    <section className="space-y-3">
      <h3 className="text-sm font-bold text-ink">飼主與照顧</h3>

      {/* 原始飼主 */}
      <div className="flex items-center gap-3 rounded-xl border border-border-t bg-white px-4 py-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-50 text-amber-500">
          <Crown size={16} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-slate-t">登記飼主</p>
          <p className="font-semibold text-ink">{isOwner ? `${member?.name}（我）` : '原登記人'}</p>
        </div>
        {isOwner && (
          <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-600">飼主</span>
        )}
      </div>

      {/* 當前主要照顧者（若不同於飼主） */}
      {hasCaregiver && (
        <div className="flex items-center gap-3 rounded-xl border border-primary bg-primary-bg px-4 py-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Heart size={16} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-slate-t">目前主要照顧者</p>
            <p className="font-semibold text-primary">
              {isCurrentCaregiver ? `${member?.name}（我）` : transfers[0]?.toMemberName ?? '照顧中'}
            </p>
            {transfers[0] && (
              <p className="text-[11px] text-slate-t">
                {TRANSFER_LABEL[transfers[0].transferType]} · {transfers[0].transferredAt.slice(0, 10)}
              </p>
            )}
          </div>
          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">照顧中</span>
        </div>
      )}

      {/* 轉移按鈕（飼主或當前照顧者才能看到） */}
      {(isOwner || isCurrentCaregiver) && (
        <button
          type="button"
          onClick={() => setTransferOpen(true)}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-border-t bg-white py-2.5 text-sm font-semibold text-slate-t transition-colors hover:border-primary hover:text-primary"
        >
          <ArrowRightLeft size={14} />
          轉移照顧權
        </button>
      )}

      {/* 轉移歷史 */}
      {transfers.length > 0 && (
        <div>
          <button
            type="button"
            onClick={() => setHistoryOpen(v => !v)}
            className="flex items-center gap-1.5 text-xs text-slate-t hover:text-primary"
          >
            <History size={12} />
            照顧轉移記錄（{transfers.length} 筆）
          </button>
          {historyOpen && (
            <div className="mt-2 space-y-1.5">
              {transfers.map(t => (
                <div key={t.id} className="rounded-lg border border-border-t bg-white px-3 py-2 text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-ink">{t.fromMemberName ?? '—'}</span>
                    <ArrowRightLeft size={10} className="text-slate-t" />
                    <span className="font-semibold text-primary">{t.toMemberName ?? '—'}</span>
                    <span className="ml-auto rounded-full bg-primary-bg px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                      {TRANSFER_LABEL[t.transferType]}
                    </span>
                  </div>
                  {t.reason && <p className="mt-0.5 text-slate-t">{t.reason}</p>}
                  <p className="mt-0.5 text-slate-t/70">{t.transferredAt.slice(0, 10)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <PetTransferDialog
        open={transferOpen}
        onOpenChange={setTransferOpen}
        petId={pet.id}
        petName={pet.name}
        onSuccess={() => {
          api.getPetTransfers(pet.id).then(setTransfers).catch(() => {})
          onTransferSuccess()
        }}
      />
    </section>
  )
}
