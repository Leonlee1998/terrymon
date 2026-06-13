import { CalendarDays, CheckCircle, DollarSign, Wallet } from 'lucide-react'
import { MOCK_TODAY_SCHEDULE } from '@/lib/mock'
import { cn } from '@/lib/utils'

const STATS = [
  { label: '今日預約', value: '5 筆', icon: CalendarDays, color: 'text-primary', bg: 'bg-primary-bg' },
  { label: '已完成', value: '2 筆', icon: CheckCircle, color: 'text-success', bg: 'bg-green-50' },
  { label: '今日營業額', value: 'NT$ 4,200', icon: DollarSign, color: 'text-accent', bg: 'bg-accent-light' },
  { label: '儲值餘額', value: 'NT$ 12,500', icon: Wallet, color: 'text-blue-500', bg: 'bg-blue-50' },
]

const STATUS_MAP = {
  completed: { label: '已完成', cls: 'bg-green-100 text-green-700' },
  'in-progress': { label: '進行中', cls: 'bg-blue-100 text-blue-700 animate-pulse' },
  pending: { label: '待服務', cls: 'bg-yellow-100 text-yellow-700' },
  cancelled: { label: '已取消', cls: 'bg-gray-100 text-gray-500' },
}

export default function AdminDashboard() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-ink mb-6">儀表板</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {STATS.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-surface border border-border-t rounded-xl p-4">
            <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center mb-3', bg)}>
              <Icon size={20} className={color} />
            </div>
            <div className="text-xl font-bold text-ink">{value}</div>
            <div className="text-xs text-slate-t mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      <div className="bg-surface border border-border-t rounded-xl">
        <div className="px-5 py-4 border-b border-border-t">
          <h2 className="font-semibold text-ink">今日排班</h2>
        </div>
        <div className="divide-y divide-border-t">
          <div className="grid grid-cols-6 px-5 py-2 text-xs font-medium text-slate-t bg-gray-50">
            <span>時間</span><span>毛孩</span><span>飼主</span>
            <span>服務</span><span>美容師</span><span>狀態</span>
          </div>
          {MOCK_TODAY_SCHEDULE.map((item) => {
            const { label, cls } = STATUS_MAP[item.status]
            return (
              <div key={item.id} className="grid grid-cols-6 px-5 py-3 text-sm items-center">
                <span className="font-mono text-slate-t">{item.time}</span>
                <span className="font-medium text-ink">{item.petName}</span>
                <span className="text-slate-t">{item.memberName}</span>
                <span className="text-slate-t">{item.service}</span>
                <span className="text-slate-t">{item.groomer}</span>
                <span className={cn('inline-flex w-fit px-2 py-0.5 rounded-full text-xs font-medium', cls)}>
                  {label}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
