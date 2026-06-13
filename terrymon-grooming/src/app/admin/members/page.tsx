'use client'
import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Search, ChevronDown } from 'lucide-react'
import { MOCK_MEMBER } from '@/lib/mock'
import type { Member } from '@/types'
import { cn } from '@/lib/utils'

const MOCK_MEMBERS: Member[] = [
  MOCK_MEMBER,
  { ...MOCK_MEMBER, id: 'M002', name: '張大明', phone: '0923-456-789', balance: 5200, points: 430, pets: [] },
  { ...MOCK_MEMBER, id: 'M003', name: '陳美玲', phone: '0934-567-890', balance: 800, points: 90, pets: [] },
]

export default function MembersPage() {
  const [query, setQuery] = useState('')
  const [expanded, setExpanded] = useState<string | null>(null)

  const filtered = MOCK_MEMBERS.filter(m =>
    m.name.includes(query) || m.phone.includes(query)
  )

  return (
    <div>
      <h1 className="text-2xl font-bold text-ink mb-6">會員管理</h1>

      <div className="relative max-w-sm mb-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-t" />
        <Input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="搜尋姓名或電話"
          className="pl-9"
        />
      </div>

      <div className="space-y-3">
        {filtered.map(m => (
          <div key={m.id} className="bg-surface border border-border-t rounded-xl overflow-hidden">
            <button
              className="w-full flex items-center justify-between px-5 py-4 text-left"
              onClick={() => setExpanded(expanded === m.id ? null : m.id)}
            >
              <div>
                <div className="font-semibold text-ink">{m.name}</div>
                <div className="text-sm text-slate-t">{m.phone}</div>
              </div>
              <div className="flex items-center gap-6 text-sm text-slate-t">
                <span>儲值 NT$ {m.balance.toLocaleString()}</span>
                <span>點數 {m.points}</span>
                <ChevronDown
                  size={16}
                  className={cn('transition-transform', expanded === m.id && 'rotate-180')}
                />
              </div>
            </button>
            {expanded === m.id && (
              <div className="border-t border-border-t px-5 py-4 text-sm text-slate-t bg-gray-50">
                <p>會員自 {m.memberSince} 加入</p>
                <p>電子信箱：{m.email}</p>
                <p className="mt-2 text-xs italic">（歷史美容紀錄功能開發中）</p>
              </div>
            )}
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="text-center text-slate-t py-12">查無符合的會員</p>
        )}
      </div>
    </div>
  )
}
