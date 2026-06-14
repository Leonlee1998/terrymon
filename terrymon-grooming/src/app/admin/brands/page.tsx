'use client'
import { useState, useEffect, useCallback } from 'react'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import BrandDialog from '@/components/admin/BrandDialog'
import { Button } from '@/components/ui/button'
import { brandApi } from '@/services/api'
import type { Brand } from '@/types'

const STATUS_LABEL: Record<string, { text: string; cls: string }> = {
  active:    { text: '已開通', cls: 'bg-green-100 text-green-700' },
  pending:   { text: '待審核', cls: 'bg-yellow-100 text-yellow-700' },
  suspended: { text: '已停用', cls: 'bg-gray-100 text-gray-500' },
}

export default function AdminBrands() {
  const [brands,  setBrands]  = useState<Brand[]>([])
  const [editing, setEditing] = useState<Brand | null | 'new'>(null)

  const load = useCallback(() => { brandApi.getBrands().then(setBrands) }, [])
  useEffect(() => { brandApi.getBrands().then(data => setBrands(data)) }, [load])

  async function handleStatusToggle(b: Brand) {
    const next = b.status === 'active' ? 'suspended' : 'active'
    setBrands(bs => bs.map(x => x.id === b.id ? { ...x, status: next } : x))
    try {
      await brandApi.setBrandStatus(b.id, next)
      toast.success(next === 'active' ? `已開通「${b.name}」` : `已停用「${b.name}」`)
    } catch {
      setBrands(bs => bs.map(x => x.id === b.id ? { ...x, status: b.status } : x))
      toast.error('更新失敗')
    }
  }

  async function handleSave(data: Omit<Brand, 'id' | 'createdAt'> & { id?: string }) {
    try {
      await brandApi.upsertBrand(data)
      toast.success(data.id ? '品牌已更新' : '品牌已新增')
      setEditing(null)
      brandApi.getBrands().then(setBrands)
    } catch (e) {
      toast.error((e as Error).message || '儲存失敗')
    }
  }

  return (
    <div className="p-6">
      <AdminPageHeader
        title="品牌管理"
        subtitle="管理已入駐的品牌商，開通後可 Push 商品至各門市"
        action={
          <Button onClick={() => setEditing('new')} className="bg-primary text-white">
            <Plus size={16} className="mr-2" />新增品牌
          </Button>
        }
      />

      <div className="bg-white rounded-2xl border border-border-t overflow-hidden">
        <div className="grid grid-cols-12 gap-2 px-5 py-3 bg-surface text-xs font-semibold text-slate-t uppercase">
          <span className="col-span-4">品牌名稱</span>
          <span className="col-span-3">聯絡人</span>
          <span className="col-span-3">聯絡電話</span>
          <span className="col-span-2 text-center">狀態</span>
        </div>
        <div className="divide-y divide-border-t">
          {brands.map(b => {
            const st = STATUS_LABEL[b.status] ?? STATUS_LABEL.pending
            return (
              <div key={b.id} className="grid grid-cols-12 gap-2 px-5 py-3 items-center">
                <div className="col-span-4">
                  <p className="font-medium text-ink text-sm">{b.name}</p>
                  {b.contactEmail && <p className="text-xs text-slate-t">{b.contactEmail}</p>}
                </div>
                <p className="col-span-3 text-sm text-slate-t">{b.contactName ?? '—'}</p>
                <p className="col-span-3 text-sm text-slate-t font-mono">{b.contactPhone ?? '—'}</p>
                <div className="col-span-2 flex items-center justify-center gap-2">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${st.cls}`}>{st.text}</span>
                  <button onClick={() => handleStatusToggle(b)}
                    className="text-xs text-primary hover:underline">
                    {b.status === 'active' ? '停用' : '開通'}
                  </button>
                  <button onClick={() => setEditing(b)}
                    className="text-xs text-slate-t hover:underline">
                    編輯
                  </button>
                </div>
              </div>
            )
          })}
          {!brands.length && <p className="text-center text-slate-t py-10 text-sm">尚無品牌，請點右上角新增</p>}
        </div>
      </div>

      <BrandDialog
        brand={editing === 'new' ? null : editing}
        open={!!editing}
        onClose={() => setEditing(null)}
        onSave={handleSave}
      />
    </div>
  )
}
