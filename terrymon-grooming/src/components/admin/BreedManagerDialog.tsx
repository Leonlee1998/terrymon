'use client'
import { useState } from 'react'
import { Plus, Search } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useAdminStore } from '@/stores/adminStore'
import type { Breed, CoatLength } from '@/types'

const COAT_LABEL: Record<CoatLength, string> = {
  short: '短毛', medium: '中毛', long: '長毛', double: '雙層毛', wire: '鋼毛',
}

const COAT_OPTIONS: CoatLength[] = ['short', 'medium', 'long', 'double', 'wire']

interface AddForm {
  name: string
  nameEn: string
  species: 'dog' | 'cat'
  defaultCoatLength: CoatLength
  defaultWeightRangeId: string
}

const EMPTY_FORM: AddForm = {
  name: '', nameEn: '', species: 'dog', defaultCoatLength: 'short', defaultWeightRangeId: 'xs',
}

interface Props {
  open: boolean
  onClose: () => void
}

export default function BreedManagerDialog({ open, onClose }: Props) {
  const { breeds, addBreed } = useAdminStore()
  const [query, setQuery] = useState('')
  const [filterSpecies, setFilterSpecies] = useState<'all' | 'dog' | 'cat'>('all')
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState<AddForm>(EMPTY_FORM)

  const filtered = breeds.filter(b => {
    const matchSpecies = filterSpecies === 'all' || b.species === filterSpecies
    const matchQuery   = !query || b.name.includes(query) || b.nameEn.toLowerCase().includes(query.toLowerCase())
    return matchSpecies && matchQuery
  })

  function handleAdd() {
    if (!form.name.trim()) return
    addBreed({
      id: `B${Date.now()}`,
      name: form.name,
      nameEn: form.nameEn,
      species: form.species,
      defaultCoatLength: form.defaultCoatLength,
      defaultWeightRangeId: form.defaultWeightRangeId,
      tags: [],
      isCustom: true,
    } as Breed)
    setForm(EMPTY_FORM)
    setShowAdd(false)
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>品種庫管理</DialogTitle>
        </DialogHeader>

        <div className="flex gap-2 mt-2">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-t" />
            <Input
              placeholder="搜尋品種名稱…"
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="pl-8"
            />
          </div>
          <div className="flex rounded-lg border border-border-t overflow-hidden text-sm">
            {(['all', 'dog', 'cat'] as const).map(v => (
              <button
                key={v}
                onClick={() => setFilterSpecies(v)}
                className={`px-3 py-1.5 transition-colors ${filterSpecies === v ? 'bg-primary text-white' : 'text-slate-t hover:bg-surface'}`}
              >
                {v === 'all' ? '全部' : v === 'dog' ? '狗' : '貓'}
              </button>
            ))}
          </div>
          <Button size="sm" onClick={() => setShowAdd(!showAdd)} className="bg-primary text-white">
            <Plus size={14} className="mr-1" />
            新增
          </Button>
        </div>

        {showAdd && (
          <div className="bg-primary-bg rounded-xl p-4 space-y-3 mt-2">
            <p className="text-sm font-semibold text-ink">新增品種</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-t">中文名稱 *</label>
                <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="mt-1" placeholder="如：柴犬" />
              </div>
              <div>
                <label className="text-xs text-slate-t">英文名稱</label>
                <Input value={form.nameEn} onChange={e => setForm(f => ({ ...f, nameEn: e.target.value }))} className="mt-1" placeholder="Shiba Inu" />
              </div>
              <div>
                <label className="text-xs text-slate-t">物種</label>
                <select
                  value={form.species}
                  onChange={e => setForm(f => ({ ...f, species: e.target.value as 'dog' | 'cat' }))}
                  className="w-full mt-1 h-9 rounded-lg border border-border-t bg-white text-sm px-2"
                >
                  <option value="dog">狗</option>
                  <option value="cat">貓</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-t">預設毛長</label>
                <select
                  value={form.defaultCoatLength}
                  onChange={e => setForm(f => ({ ...f, defaultCoatLength: e.target.value as CoatLength }))}
                  className="w-full mt-1 h-9 rounded-lg border border-border-t bg-white text-sm px-2"
                >
                  {COAT_OPTIONS.map(c => <option key={c} value={c}>{COAT_LABEL[c]}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" size="sm" onClick={() => { setShowAdd(false); setForm(EMPTY_FORM) }}>取消</Button>
              <Button size="sm" onClick={handleAdd} className="bg-primary text-white">確認新增</Button>
            </div>
          </div>
        )}

        <div className="overflow-y-auto mt-2 flex-1 min-h-0">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-surface">
              <tr>
                <th className="text-left px-3 py-2 text-slate-t font-semibold">品種</th>
                <th className="text-left px-3 py-2 text-slate-t font-semibold">英文</th>
                <th className="px-3 py-2 text-slate-t font-semibold text-center">物種</th>
                <th className="px-3 py-2 text-slate-t font-semibold text-center">預設毛長</th>
                <th className="px-3 py-2 text-slate-t font-semibold text-center">類型</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-t">
              {filtered.map(b => (
                <tr key={b.id} className="hover:bg-surface/50">
                  <td className="px-3 py-2 font-medium text-ink">{b.name}</td>
                  <td className="px-3 py-2 text-slate-t">{b.nameEn}</td>
                  <td className="px-3 py-2 text-center">{b.species === 'dog' ? '🐕 狗' : '🐈 貓'}</td>
                  <td className="px-3 py-2 text-center">{COAT_LABEL[b.defaultCoatLength]}</td>
                  <td className="px-3 py-2 text-center">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${b.isCustom ? 'bg-accent/15 text-accent' : 'bg-surface text-slate-t'}`}>
                      {b.isCustom ? '自訂' : '預設'}
                    </span>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center text-slate-t py-8 text-sm">查無品種</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <p className="text-xs text-slate-t text-right mt-2">共 {filtered.length} 筆</p>
      </DialogContent>
    </Dialog>
  )
}
