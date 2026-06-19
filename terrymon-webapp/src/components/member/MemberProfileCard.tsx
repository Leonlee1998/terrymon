'use client'
import { useState } from 'react'
import Image from 'next/image'
import { Camera, CheckCircle2, Edit2, Mail, MapPin, PawPrint, Phone } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import type { Member } from '@/types'
import { useAuthStore } from '@/stores/authStore'
import AvatarPickerDialog from './AvatarPickerDialog'
import MemberEditDialog from './MemberEditDialog'

const TIER_CONFIG = {
  basic:  { label: '普通會員', emoji: '🎖️' },
  silver: { label: '銀卡會員', emoji: '🥈' },
  gold:   { label: '金卡會員', emoji: '🥇' },
}

function VerifiedBadge({ verified }: { verified?: boolean }) {
  if (verified) return <CheckCircle2 size={13} className="shrink-0 text-green-300" />
  return <span className="shrink-0 text-[10px] px-1.5 py-0.5 rounded-full bg-white/20 text-white/60">未認證</span>
}

export default function MemberProfileCard({ member }: { member: Member }) {
  const { member: storeMember } = useAuthStore()
  const m = storeMember ?? member
  const [avatarOpen, setAvatarOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const tier = TIER_CONFIG[m.tier]
  const sa = m.shippingAddress

  return (
    <>
      {/* ── 個人資訊 ── */}
      <div className="bg-gradient-to-br from-primary to-primary-light rounded-2xl p-5 text-white">
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <button
            type="button"
            onClick={() => setAvatarOpen(true)}
            className="relative size-16 rounded-full overflow-hidden bg-white/20 shrink-0 ring-2 ring-white/40 group"
          >
            {m.avatarUrl ? (
              <Image src={m.avatarUrl} alt={m.name} fill className="object-cover" unoptimized={m.avatarUrl.startsWith('data:')} />
            ) : (
              <span className="flex size-full items-center justify-center text-2xl font-black">{m.name[0]}</span>
            )}
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera size={16} className="text-white" />
            </div>
          </button>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-black leading-tight">{m.name}</h2>
            <div className="flex items-center gap-1.5 mt-1.5">
              <Phone size={11} className="text-white/50 shrink-0" />
              <span className="text-sm text-white/80">{m.phone}</span>
              <VerifiedBadge verified={m.isPhoneVerified} />
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <Mail size={11} className="text-white/50 shrink-0" />
              <span className="text-xs text-white/70 truncate">{m.email}</span>
              <VerifiedBadge verified={m.isEmailVerified} />
            </div>
          </div>

          <button
            onClick={() => setEditOpen(true)}
            className="p-2 bg-white/20 rounded-xl hover:bg-white/30 transition-colors shrink-0"
          >
            <Edit2 size={16} />
          </button>
        </div>

        {/* Badges */}
        <div className="flex items-center gap-2 mt-4 flex-wrap">
          <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-white/20">
            {tier.emoji} {tier.label}
          </span>
          <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-white/20">
            <PawPrint size={11} /> {m.pets.length} 隻寵物
          </span>
          <span className="text-xs text-white/50 ml-auto">加入於 {formatDate(m.memberSince)}</span>
        </div>

        {/* 寄件資訊 hint row */}
        <button
          onClick={() => setEditOpen(true)}
          className="mt-3 pt-3 border-t border-white/20 w-full flex items-center justify-between group"
        >
          <div className="flex items-center gap-1.5">
            <MapPin size={12} className="text-white/60 shrink-0" />
            {sa ? (
              <span className="text-xs text-white/80">{sa.recipientName}・{sa.city}{sa.district} {sa.address}</span>
            ) : (
              <span className="text-xs text-white/50">寄件資訊未設定（點此新增）</span>
            )}
          </div>
          <Edit2 size={11} className="text-white/40 group-hover:text-white/70 transition-colors shrink-0" />
        </button>
      </div>

      <AvatarPickerDialog open={avatarOpen} onOpenChange={setAvatarOpen} currentAvatarUrl={m.avatarUrl} />
      <MemberEditDialog open={editOpen} onOpenChange={setEditOpen} member={m} />
    </>
  )
}
