'use client'

import { useState } from 'react'
import { Mail, MessageCircle, Phone, Plus, Trash2, X } from 'lucide-react'
import { toast } from 'sonner'
import { api } from '@/services/api'
import type { EmergencyContact } from '@/types'

const RELATIONS = ['家人', '朋友', '鄰居', '獸醫', '其他']

type ContactForm = {
  name: string
  phone: string
  lineId: string
  email: string
  relation: string
  note: string
}

const emptyForm: ContactForm = { name: '', phone: '', lineId: '', email: '', relation: '家人', note: '' }

export default function EmergencyContactsSection({
  petId,
  contacts,
  onUpdate,
}: {
  petId: string
  contacts: EmergencyContact[]
  onUpdate: (c: EmergencyContact[]) => void
}) {
  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState<ContactForm>(emptyForm)
  const [saving, setSaving] = useState(false)

  async function handleAdd() {
    if (!form.name.trim()) { toast.error('請填寫姓名'); return }
    if (!form.phone.trim() && !form.lineId.trim() && !form.email.trim()) {
      toast.error('至少填寫一種聯絡方式')
      return
    }
    setSaving(true)
    try {
      const contact = await api.addEmergencyContact(petId, {
        name: form.name.trim(),
        phone: form.phone.trim() || undefined,
        lineId: form.lineId.trim() || undefined,
        email: form.email.trim() || undefined,
        relation: form.relation,
        note: form.note.trim() || undefined,
      })
      onUpdate([...contacts, contact])
      setAdding(false)
      setForm(emptyForm)
    } catch {
      toast.error('新增失敗，請再試一次')
    } finally {
      setSaving(false)
    }
  }

  async function handleRemove(id: string) {
    try {
      await api.removeEmergencyContact(id)
      onUpdate(contacts.filter(c => c.id !== id))
    } catch {
      toast.error('刪除失敗，請再試一次')
    }
  }

  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-bold text-ink">緊急聯絡人</h3>
        {!adding && contacts.length < 3 && (
          <button onClick={() => setAdding(true)} className="flex items-center gap-1 text-xs font-semibold text-primary">
            <Plus size={13} /> 新增
          </button>
        )}
      </div>

      {contacts.length === 0 && !adding && (
        <p className="rounded-xl bg-surface py-4 text-center text-sm text-slate-t">尚無緊急聯絡人</p>
      )}

      <div className="space-y-2">
        {contacts.map(c => (
          <div key={c.id} className="rounded-xl border border-border-t bg-white px-4 py-3">
            <div className="flex items-start gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-ink">{c.name}</span>
                  <span className="rounded-full bg-primary-bg px-2 py-0.5 text-[11px] font-semibold text-primary">{c.relation}</span>
                </div>
                <div className="mt-1.5 space-y-1">
                  {c.phone && (
                    <div className="flex items-center gap-1.5 text-sm text-slate-t">
                      <Phone size={12} className="shrink-0 text-primary" />
                      {c.phone}
                    </div>
                  )}
                  {c.lineId && (
                    <div className="flex items-center gap-1.5 text-sm text-slate-t">
                      <MessageCircle size={12} className="shrink-0 text-green-500" />
                      LINE: {c.lineId}
                    </div>
                  )}
                  {c.email && (
                    <div className="flex items-center gap-1.5 text-sm text-slate-t">
                      <Mail size={12} className="shrink-0 text-blue-400" />
                      {c.email}
                    </div>
                  )}
                  {c.note && <p className="text-xs text-slate-t/80 italic">{c.note}</p>}
                </div>
              </div>
              <button onClick={() => handleRemove(c.id)} className="shrink-0 p-1 text-slate-300 transition-colors hover:text-red-400">
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {adding && (
        <div className="mt-2 space-y-2 rounded-xl border border-primary bg-primary-bg p-4">
          <input
            placeholder="姓名 *"
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            className="w-full rounded-lg border border-border-t bg-white px-3 py-2 text-sm outline-none focus:border-primary"
          />

          <div className="flex gap-2 overflow-x-auto pb-1">
            {RELATIONS.map(r => (
              <button
                key={r}
                type="button"
                onClick={() => setForm(f => ({ ...f, relation: r }))}
                className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                  form.relation === r ? 'bg-primary text-white' : 'border border-border-t bg-white text-slate-t'
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          <p className="text-[11px] font-medium text-slate-t">聯絡方式（至少填一種）</p>

          <div className="flex items-center gap-2">
            <Phone size={14} className="shrink-0 text-primary" />
            <input
              placeholder="電話"
              type="tel"
              value={form.phone}
              onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
              className="flex-1 rounded-lg border border-border-t bg-white px-3 py-2 text-sm outline-none focus:border-primary"
            />
          </div>
          <div className="flex items-center gap-2">
            <MessageCircle size={14} className="shrink-0 text-green-500" />
            <input
              placeholder="LINE ID"
              value={form.lineId}
              onChange={e => setForm(f => ({ ...f, lineId: e.target.value }))}
              className="flex-1 rounded-lg border border-border-t bg-white px-3 py-2 text-sm outline-none focus:border-primary"
            />
          </div>
          <div className="flex items-center gap-2">
            <Mail size={14} className="shrink-0 text-blue-400" />
            <input
              placeholder="Email"
              type="email"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              className="flex-1 rounded-lg border border-border-t bg-white px-3 py-2 text-sm outline-none focus:border-primary"
            />
          </div>
          <input
            placeholder="備註（選填）"
            value={form.note}
            onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
            className="w-full rounded-lg border border-border-t bg-white px-3 py-2 text-sm outline-none focus:border-primary"
          />

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={() => { setAdding(false); setForm(emptyForm) }}
              className="flex flex-1 items-center justify-center gap-1 rounded-lg border border-border-t py-2 text-sm text-slate-t"
            >
              <X size={13} /> 取消
            </button>
            <button
              type="button"
              onClick={handleAdd}
              disabled={saving}
              className="flex-1 rounded-lg bg-primary py-2 text-sm font-semibold text-white disabled:opacity-60"
            >
              {saving ? '儲存中...' : '確認新增'}
            </button>
          </div>
        </div>
      )}
    </section>
  )
}
