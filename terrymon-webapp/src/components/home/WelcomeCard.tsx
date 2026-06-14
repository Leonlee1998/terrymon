'use client'
import Image from 'next/image'
import type { Appointment, Member } from '@/types'
import { useAuthStore } from '@/stores/authStore'

interface Props {
  member: Member
  appointment: Appointment | null
}

export default function WelcomeCard({ member, appointment }: Props) {
  const { member: storeMember } = useAuthStore()
  // storeMember has live client-side updates (e.g. avatarUrl); server prop is the SSR fallback
  const m = storeMember ?? member
  const pet = m.pets[0]
  const hour = new Date().getHours()
  const greeting = hour < 12 ? '早安' : hour < 18 ? '午安' : '晚安'
  const tierLabel = m.tier === 'gold' ? '金卡會員' : m.tier === 'silver' ? '銀卡會員' : '一般會員'

  return (
    <section className="relative overflow-hidden rounded-[28px] border border-white/70 bg-[#fff4df] p-5 shadow-sm shadow-[#e8b56e]/20 md:p-6">
      <div className="absolute -right-10 -top-10 size-36 rounded-full bg-accent/15" />
      <div className="absolute -bottom-12 left-8 size-32 rounded-full bg-primary/10" />

      <div className="relative flex items-center gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-accent">{greeting}，{m.name}</p>
          <h2 className="mt-1 text-2xl font-black leading-tight text-ink md:text-3xl">
            今天也一起照顧好 {pet?.name ?? '毛孩'}
          </h2>
          {appointment ? (
            <p className="mt-3 text-sm leading-6 text-[#6d6258]">
              {pet?.name} 今天 {appointment.time} 有
              {appointment.type === 'vet' ? '看診' : '美容'}預約，記得提早出門。
            </p>
          ) : (
            <p className="mt-3 text-sm leading-6 text-[#6d6258]">
              今天沒有預約，可以看看健康紀錄或幫毛孩補點日用品。
            </p>
          )}
          <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1.5 text-xs font-bold text-primary shadow-sm">
            {tierLabel}
            <span className="h-3 w-px bg-[#eadfd2]" />
            {m.points} 點
          </div>
        </div>

        <div className="hidden size-28 shrink-0 rounded-full overflow-hidden ring-4 ring-white/60 sm:block md:size-32">
          <Image
            src={m.avatarUrl ?? '/assets/terrymon-mascot.png'}
            alt={m.name}
            width={132}
            height={132}
            className="size-full object-cover"
            priority
            unoptimized={m.avatarUrl?.startsWith('data:')}
          />
        </div>
      </div>
    </section>
  )
}
