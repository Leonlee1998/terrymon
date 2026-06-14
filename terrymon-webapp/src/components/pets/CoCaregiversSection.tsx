'use client'

import { useState } from 'react'
import { Copy, Search, UserPlus } from 'lucide-react'
import { toast } from 'sonner'
import { api } from '@/services/api'
import type { PetCaregiver } from '@/types'
import CaregiverCard from './CaregiverCard'

type SearchResult =
  | { type: 'member'; member: { id: string; name: string; handle?: string; avatarUrl?: string } }
  | { type: 'notfound' }
  | null

export default function CoCaregiversSection({
  petId,
  caregivers,
  onUpdate,
}: {
  petId: string
  caregivers: PetCaregiver[]
  onUpdate: (c: PetCaregiver[]) => void
}) {
  const [query, setQuery] = useState('')
  const [searching, setSearching] = useState(false)
  const [result, setResult] = useState<SearchResult>(null)
  const [copying, setCopying] = useState(false)

  async function handleSearch() {
    const q = query.trim()
    if (!q) return
    setSearching(true)
    setResult(null)
    try {
      const res = await api.searchMemberForInvite(q)
      setResult(res.found && res.member ? { type: 'member', member: res.member } : { type: 'notfound' })
    } catch {
      toast.error('搜尋失敗，請再試一次')
    } finally {
      setSearching(false)
    }
  }

  async function handleInvite(member: { id: string; name: string; handle?: string; avatarUrl?: string }) {
    const already = caregivers.some(c => c.memberId === member.id)
    if (already) { toast.info('此成員已在照護者名單中'); return }
    try {
      const cg = await api.inviteCaregiver(petId, {
        memberId: member.id,
        memberName: member.name,
        memberHandle: member.handle,
        memberAvatarUrl: member.avatarUrl,
      })
      onUpdate([...caregivers, cg])
      setResult(null)
      setQuery('')
      toast.success(`已送出邀請給 ${member.name}`)
    } catch {
      toast.error('邀請失敗，請再試一次')
    }
  }

  async function handleCopyLink() {
    setCopying(true)
    try {
      const link = await api.generateInviteLink(petId)
      await navigator.clipboard.writeText(link)
      toast.success('連結已複製，傳給朋友即可加入')
      setResult(null)
      setQuery('')
    } catch {
      toast.error('複製失敗，請再試一次')
    } finally {
      setCopying(false)
    }
  }

  async function handleUpdatePermissions(caregiverId: string, permissions: PetCaregiver['permissions']) {
    await api.updateCaregiverPermissions(caregiverId, permissions)
    onUpdate(caregivers.map(c => c.id === caregiverId ? { ...c, permissions } : c))
  }

  async function handleRemove(caregiverId: string) {
    await api.removeCaregiver(caregiverId)
    onUpdate(caregivers.filter(c => c.id !== caregiverId))
  }

  return (
    <section>
      <h3 className="mb-3 text-sm font-bold text-ink">共同照護者</h3>

      <div className="flex gap-2">
        <input
          placeholder="電話 / Email / @handle"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSearch()}
          className="flex-1 rounded-xl border border-border-t bg-white px-3 py-2.5 text-sm outline-none focus:border-primary"
        />
        <button
          onClick={handleSearch}
          disabled={searching || !query.trim()}
          className="rounded-xl bg-primary px-4 text-white disabled:opacity-50"
          aria-label="搜尋"
        >
          <Search size={16} />
        </button>
      </div>

      {result && (
        <div className="mt-2 rounded-xl border border-border-t bg-white p-3">
          {result.type === 'member' ? (
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-bg text-sm font-bold text-primary">
                {result.member.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-ink">{result.member.name}</p>
                {result.member.handle && <p className="text-xs text-slate-t">@{result.member.handle}</p>}
              </div>
              <button
                onClick={() => handleInvite(result.member)}
                className="flex shrink-0 items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white"
              >
                <UserPlus size={13} /> 邀請
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-slate-t">找不到對應會員</p>
              <button
                onClick={handleCopyLink}
                disabled={copying}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-primary py-2 text-sm font-semibold text-primary disabled:opacity-60"
              >
                <Copy size={14} />
                {copying ? '產生連結中...' : '複製邀請連結（48 小時有效）'}
              </button>
            </div>
          )}
        </div>
      )}

      {caregivers.length === 0 ? (
        <p className="mt-3 rounded-xl bg-surface py-4 text-center text-sm text-slate-t">尚無共同照護者</p>
      ) : (
        <div className="mt-3 space-y-2">
          {caregivers.map(c => (
            <CaregiverCard
              key={c.id}
              caregiver={c}
              onUpdatePermissions={p => handleUpdatePermissions(c.id, p)}
              onRemove={() => handleRemove(c.id)}
            />
          ))}
        </div>
      )}
    </section>
  )
}
