'use client'
import { useState, useEffect, useCallback } from 'react'
import { Settings2 } from 'lucide-react'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import MonthlySchedule from '@/components/admin/MonthlySchedule'
import StoreSettings from '@/components/admin/StoreSettings'
import type { Groomer } from '@/components/admin/MonthlySchedule'
import { toast } from 'sonner'

type Tab = 'schedule' | 'settings'

export default function AdminSchedule() {
  const now = new Date()
  const [year,     setYear]     = useState(now.getFullYear())
  const [month,    setMonth]    = useState(now.getMonth() + 1)
  const [groomers, setGroomers] = useState<Groomer[]>([])
  const [tab,      setTab]      = useState<Tab>('schedule')

  const loadGroomers = useCallback(async () => {
    try {
      const res  = await fetch('/api/admin/groomers')
      const data = await res.json() as Groomer[]
      setGroomers(Array.isArray(data) ? data : [])
    } catch {
      toast.error('美容師載入失敗')
    }
  }, [])

  useEffect(() => { void loadGroomers() }, [loadGroomers])

  function prevMonth() {
    if (month === 1) { setYear(y => y - 1); setMonth(12) } else setMonth(m => m - 1)
  }
  function nextMonth() {
    if (month === 12) { setYear(y => y + 1); setMonth(1) } else setMonth(m => m + 1)
  }
  function jumpTo(y: number, m: number) { setYear(y); setMonth(m) }

  return (
    <div className="p-6">
      <AdminPageHeader
        title="排班管理"
        subtitle={`${year} 年 ${month} 月`}
        action={
          <button
            onClick={() => setTab(t => t === 'settings' ? 'schedule' : 'settings')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium border transition-colors ${
              tab === 'settings'
                ? 'bg-primary text-white border-primary'
                : 'bg-white border-border-t text-slate-t hover:border-primary/50'
            }`}
          >
            <Settings2 size={14} /> 設定
          </button>
        }
      />

      {tab === 'schedule' && (
        <MonthlySchedule
          groomers={groomers}
          year={year}
          month={month}
          onPrev={prevMonth}
          onNext={nextMonth}
          onMonthChange={jumpTo}
        />
      )}

      {tab === 'settings' && (
        <StoreSettings />
      )}
    </div>
  )
}
