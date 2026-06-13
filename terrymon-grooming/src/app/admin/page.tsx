import { MOCK_TODAY_SCHEDULE } from '@/lib/mock'
import { CalendarDays, CheckCircle, DollarSign, Users } from 'lucide-react'
import AdminPageHeader from '@/components/admin/AdminPageHeader'

const STATS = [
  { label: '今日預約',  value: '5 筆',       icon: CalendarDays, color: 'text-primary bg-primary-bg' },
  { label: '已完成',    value: '2 筆',       icon: CheckCircle,  color: 'text-green-600 bg-green-50' },
  { label: '今日營業額', value: 'NT$ 4,200', icon: DollarSign,   color: 'text-accent bg-accent-light' },
  { label: '儲值餘額',  value: 'NT$ 12,500', icon: Users,        color: 'text-blue-600 bg-blue-50' },
]

const STATUS_CONFIG = {
  completed:    { label: '已完成',  className: 'bg-green-100 text-green-700' },
  'in-progress': { label: '進行中', className: 'bg-blue-100 text-blue-700 animate-pulse' },
  pending:      { label: '等待中',  className: 'bg-yellow-100 text-yellow-700' },
  cancelled:    { label: '已取消',  className: 'bg-gray-100 text-gray-500' },
}

export default function AdminDashboard() {
  return (
    <div className="p-6">
      <AdminPageHeader title="儀表板" subtitle="今日營業概況" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {STATS.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-2xl border border-border-t p-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}>
              <Icon size={20} />
            </div>
            <p className="text-2xl font-black text-ink">{value}</p>
            <p className="text-xs text-slate-t mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-border-t overflow-hidden">
        <div className="px-6 py-4 border-b border-border-t flex items-center justify-between">
          <h2 className="font-bold text-ink">今日排班</h2>
          <span className="text-xs text-slate-t">{new Date().toLocaleDateString('zh-TW')}</span>
        </div>
        <div className="divide-y divide-border-t">
          {MOCK_TODAY_SCHEDULE.map(item => {
            const statusCfg = STATUS_CONFIG[item.status]
            return (
              <div key={item.id} className="grid grid-cols-6 gap-4 px-6 py-4 items-center">
                <div>
                  <p className="font-semibold text-ink text-sm">{item.time}</p>
                  <p className="text-xs text-slate-t">{item.endTime}</p>
                </div>
                <div className="col-span-2">
                  <p className="font-medium text-ink text-sm">{item.petName}</p>
                  <p className="text-xs text-slate-t">{item.memberName}</p>
                </div>
                <p className="text-sm text-ink col-span-2">{item.service}</p>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-slate-t">{item.groomer}</p>
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${statusCfg.className}`}>
                    {statusCfg.label}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
