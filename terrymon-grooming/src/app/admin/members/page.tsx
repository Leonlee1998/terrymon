'use client'
import { useState } from 'react'
import { Search } from 'lucide-react'
import { MOCK_MEMBER, MOCK_PETS } from '@/lib/mock'
import { formatDate, formatPrice } from '@/lib/utils'
import AdminPageHeader from '@/components/admin/AdminPageHeader'

const MOCK_MEMBERS_LIST = [
  { ...MOCK_MEMBER, pets: MOCK_PETS, lastVisit: '2026-06-01', totalSpent: 4800 },
  {
    id: 'M002', name: '張大明', phone: '0923-456-789', email: 'zhang@example.com',
    balance: 0, points: 50, tier: 'bronze' as const, memberSince: '2024-01-15',
    qrCode: 'TERRYMON-M002', lastVisit: '2026-05-15', totalSpent: 1200,
    pets: [{
      id: 'P003', name: '胖虎', species: 'dog' as const, breed: '拉不拉多',
      birthDate: '2018-06-01', weight: 32, photoUrl: 'https://placedog.net/100/100?id=5',
      allergies: [], notes: '', memberId: 'M002', isActive: true,
    }],
  },
]

export default function AdminMembers() {
  const [search, setSearch] = useState('')
  const [expanded, setExpanded] = useState<string | null>(null)

  const filtered = MOCK_MEMBERS_LIST.filter(m =>
    m.name.includes(search) || m.phone.includes(search)
  )

  return (
    <div className="p-6">
      <AdminPageHeader title="會員查詢" subtitle="查詢會員資料與服務紀錄" />

      <div className="relative mb-6">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-t" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="搜尋姓名或手機號碼..."
          className="w-full h-11 pl-9 pr-4 rounded-xl border border-border-t bg-white text-sm focus:outline-none focus:border-primary"
        />
      </div>

      <div className="space-y-3">
        {filtered.map(member => (
          <div key={member.id} className="bg-white rounded-2xl border border-border-t overflow-hidden">
            <button
              className="w-full flex items-center gap-4 p-4 text-left"
              onClick={() => setExpanded(expanded === member.id ? null : member.id)}
            >
              <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-white font-black text-lg flex-shrink-0">
                {member.name[0]}
              </div>
              <div className="flex-1">
                <p className="font-bold text-ink">{member.name}</p>
                <p className="text-sm text-slate-t">{member.phone}</p>
              </div>
              <div className="text-right text-sm">
                <p className="text-slate-t">{member.pets.length} 隻寵物</p>
                <p className="font-semibold text-primary">{formatPrice(member.balance)} 儲值</p>
              </div>
            </button>
            {expanded === member.id && (
              <div className="border-t border-border-t px-4 pb-4 pt-3 space-y-3">
                <div className="grid grid-cols-3 gap-3 text-sm">
                  <div className="bg-surface rounded-xl p-3">
                    <p className="text-xs text-slate-t">最後到訪</p>
                    <p className="font-medium">{formatDate(member.lastVisit)}</p>
                  </div>
                  <div className="bg-surface rounded-xl p-3">
                    <p className="text-xs text-slate-t">點數</p>
                    <p className="font-medium">{member.points} 點</p>
                  </div>
                  <div className="bg-surface rounded-xl p-3">
                    <p className="text-xs text-slate-t">累計消費</p>
                    <p className="font-medium">{formatPrice(member.totalSpent)}</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-t mb-2">旗下寵物</p>
                  <div className="flex gap-2 flex-wrap">
                    {member.pets.map(pet => (
                      <span key={pet.id} className="text-xs bg-primary-bg text-primary px-2.5 py-1 rounded-full font-medium">
                        {pet.name} ({pet.breed})
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
