import type { Appointment } from '@/types'
import { CalendarDays, MapPin, Clock } from 'lucide-react'
import Link from 'next/link'

interface Props { appointment: Appointment | null }

export default function TodaySchedule({ appointment }: Props) {
  return (
    <div className="bg-white rounded-2xl border border-border-t p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <CalendarDays size={16} className="text-primary" />
          <h3 className="font-semibold text-sm text-ink">今日行程</h3>
        </div>
        <Link href="/appointments" className="text-xs text-primary">查看全部</Link>
      </div>

      {appointment ? (
        <div className="flex items-start gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
            appointment.type === 'vet' ? 'bg-primary-bg' : 'bg-accent-light'
          }`}>
            <span className="text-xl">{appointment.type === 'vet' ? '🏥' : '✂️'}</span>
          </div>
          <div className="flex-1">
            <p className="font-semibold text-ink">
              {appointment.type === 'vet' ? '獸醫回診' : '寵物美容'}
            </p>
            <div className="flex items-center gap-1 text-xs text-slate-t mt-1">
              <Clock size={12} />
              <span>{appointment.date} {appointment.time}</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-slate-t mt-0.5">
              <MapPin size={12} />
              <span>{appointment.location}</span>
            </div>
          </div>
          <span className="bg-primary-bg text-primary text-xs font-medium px-2 py-1 rounded-full">
            已確認
          </span>
        </div>
      ) : (
        <div className="text-center py-4">
          <p className="text-slate-t text-sm">今天沒有行程，享受輕鬆的一天 🌿</p>
          <Link href="/appointments" className="text-xs text-primary mt-2 inline-block">
            新增預約 →
          </Link>
        </div>
      )}
    </div>
  )
}
