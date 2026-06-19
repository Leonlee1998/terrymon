'use client'
import { useState, useEffect, useCallback } from 'react'
import { Search, ChevronDown, ChevronRight, RefreshCw } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import AdminPageHeader from '@/components/admin/AdminPageHeader'

type Pet = { id: string; name: string; species: string; breed: string; weight: number; allergies: string[] }
type Appt = { id: string; scheduled_date: string; status: string }
type MemberRow = {
  id: string
  name: string
  phone: string
  email: string | null
  platform_balance: number
  points: number
  tier: string
  created_at: string
  pets: Pet[]
  appointments: Appt[]
}

const TIER_LABEL: Record<string, string> = { basic: '一般', silver: '銀卡', gold: '金卡' }
const SPECIES_EMOJI: Record<string, string> = { dog: '🐶', cat: '🐱' }

export default function AdminMembers() {
  const [members, setMembers] = useState<MemberRow[]>([])
  const [search, setSearch]   = useState('')
  const [expanded, setExpanded] = useState<string | null>(null)
  const [loading, setLoading]  = useState(true)

  const load = useCallback(async (q?: string) => {
    setLoading(true)
    try {
      const url = q ? `/api/admin/members?q=${encodeURIComponent(q)}` : '/api/admin/members'
      const res  = await fetch(url)
      const data = await res.json() as MemberRow[]
      setMembers(Array.isArray(data) ? data : [])
    } catch {
      setMembers([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { void load() }, [load])

  // debounce search
  useEffect(() => {
    if (search.length === 0) { void load(); return }
    if (search.length < 2) return
    const t = setTimeout(() => void load(search), 400)
    return () => clearTimeout(t)
  }, [search, load])

  return (
    <div className="p-6">
      <AdminPageHeader
        title="會員查詢"
        subtitle={`共 ${members.length} 位${search ? '（搜尋結果）' : ''}`}
        action={
          <button onClick={() => void load(search || undefined)} className="p-2 rounded-xl hover:bg-surface text-slate-t">
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
        }
      />

      <div className="relative mb-6">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-t" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="搜尋姓名或手機號碼…"
          className="w-full h-11 pl-9 pr-4 rounded-xl border border-border-t bg-white text-sm focus:outline-none focus:border-primary"
        />
      </div>

      {loading && members.length === 0 && (
        <div className="text-center py-16 text-slate-t text-sm">載入中…</div>
      )}

      {!loading && members.length === 0 && (
        <div className="text-center py-16 text-slate-t text-sm">
          {search ? '找不到符合的會員' : '尚無會員資料'}
        </div>
      )}

      <div className="space-y-2">
        {members.map(member => {
          const totalAppts = member.appointments?.length ?? 0
          const lastAppt   = member.appointments?.sort((a, b) => b.scheduled_date.localeCompare(a.scheduled_date))[0]
          const isOpen     = expanded === member.id

          return (
            <div key={member.id} className="bg-white rounded-2xl border border-border-t overflow-hidden">
              <button
                className="w-full flex items-center gap-4 p-4 text-left"
                onClick={() => setExpanded(isOpen ? null : member.id)}
              >
                <div className="w-11 h-11 rounded-xl bg-primary flex items-center justify-center text-white font-black text-lg shrink-0">
                  {member.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-ink">{member.name}</p>
                    <span className="text-[11px] bg-surface px-2 py-0.5 rounded-full text-slate-t">
                      {TIER_LABEL[member.tier] ?? member.tier}
                    </span>
                  </div>
                  <p className="text-sm text-slate-t">{member.phone}</p>
                </div>
                <div className="text-right text-sm shrink-0">
                  <p className="text-slate-t">{member.pets?.length ?? 0} 隻寵物・{totalAppts} 次預約</p>
                  <p className="font-semibold text-primary">{formatPrice(member.platform_balance ?? 0)} 儲值</p>
                </div>
                {isOpen
                  ? <ChevronDown size={16} className="text-slate-t shrink-0" />
                  : <ChevronRight size={16} className="text-slate-t shrink-0" />}
              </button>

              {isOpen && (
                <div className="border-t border-border-t p-4 space-y-4">
                  <div className="grid grid-cols-3 gap-3 text-sm">
                    <div className="bg-surface rounded-xl p-3">
                      <p className="text-xs text-slate-t">上次預約</p>
                      <p className="font-medium">{lastAppt ? lastAppt.scheduled_date : '無'}</p>
                    </div>
                    <div className="bg-surface rounded-xl p-3">
                      <p className="text-xs text-slate-t">點數</p>
                      <p className="font-medium">{member.points} 點</p>
                    </div>
                    <div className="bg-surface rounded-xl p-3">
                      <p className="text-xs text-slate-t">儲值餘額</p>
                      <p className="font-medium text-primary">{formatPrice(member.platform_balance ?? 0)}</p>
                    </div>
                  </div>

                  {member.pets && member.pets.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-slate-t mb-2">旗下寵物</p>
                      <div className="flex flex-wrap gap-2">
                        {member.pets.map(pet => (
                          <div key={pet.id} className="flex items-center gap-1.5 bg-primary-bg rounded-xl px-3 py-1.5">
                            <span className="text-sm">{SPECIES_EMOJI[pet.species] ?? '🐾'}</span>
                            <div>
                              <span className="text-sm font-medium text-ink">{pet.name}</span>
                              <span className="text-xs text-slate-t ml-1">{pet.breed}・{pet.weight}kg</span>
                            </div>
                            {pet.allergies?.length > 0 && (
                              <span className="text-xs text-amber-600 ml-1">⚠️過敏</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {member.email && (
                    <p className="text-xs text-slate-t">Email：{member.email}</p>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
