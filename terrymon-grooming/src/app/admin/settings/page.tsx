'use client'
import { useState } from 'react'
import { useAdminStore } from '@/stores/adminStore'
import { toast } from 'sonner'
import { Plus, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import TopupPlanEditor from '@/components/admin/TopupPlanEditor'
import type { Groomer } from '@/types'

export default function AdminSettings() {
  const {
    contractTemplate, groomers, shopName, shopPhone, shopAddress, shopLineId,
    updateContractTemplate, addGroomer, toggleGroomer, updateShopInfo,
  } = useAdminStore()

  const [newName, setNewName] = useState('')
  const [shopForm, setShopForm] = useState({ shopName, shopPhone, shopAddress, shopLineId })

  function handleAddGroomer() {
    if (!newName.trim()) return
    const g: Groomer = {
      id: `G${Date.now()}`,
      storeId: 'S001',
      name: newName.trim(),
      rank: 'stylist',
      specialties: [],
      maxDailySlots: 5,
      isActive: true,
      joinedAt: new Date().toISOString().split('T')[0],
    }
    addGroomer(g)
    setNewName('')
    toast.success('已新增美容師')
  }

  return (
    <div className="p-6 space-y-8">
      <AdminPageHeader title="系統設定" subtitle="管理店家資訊與合約設定" />

      {/* Shop info */}
      <section className="bg-white rounded-2xl border border-border-t p-6">
        <h2 className="font-bold text-ink mb-4">店家基本資訊</h2>
        <div className="grid grid-cols-2 gap-4">
          {([
            { key: 'shopName',    label: '店名' },
            { key: 'shopPhone',   label: '電話' },
            { key: 'shopAddress', label: '地址' },
            { key: 'shopLineId',  label: 'LINE ID' },
          ] as const).map(({ key, label }) => (
            <div key={key} className={key === 'shopAddress' ? 'col-span-2' : ''}>
              <label className="text-sm font-medium text-ink">{label}</label>
              <Input
                value={shopForm[key]}
                onChange={e => setShopForm(p => ({ ...p, [key]: e.target.value }))}
                className="mt-1"
              />
            </div>
          ))}
        </div>
        <Button
          onClick={() => { updateShopInfo(shopForm); toast.success('店家資訊已更新') }}
          className="mt-4 bg-primary hover:bg-primary-hover text-white"
        >
          儲存店家資訊
        </Button>
      </section>

      {/* Groomers */}
      <section className="bg-white rounded-2xl border border-border-t p-6">
        <h2 className="font-bold text-ink mb-4">美容師管理</h2>
        <div className="flex flex-wrap gap-2 mb-4">
          {groomers.map(g => (
            <span
              key={g.id}
              className={`flex items-center gap-1.5 border rounded-xl px-3 py-1.5 text-sm transition-opacity ${
                g.isActive ? 'bg-surface border-border-t' : 'bg-gray-50 border-border-t opacity-50'
              }`}
            >
              {g.name}
              <button
                onClick={() => { toggleGroomer(g.id); toast.success(g.isActive ? '已停用' : '已啟用') }}
                className="text-slate-t hover:text-red-500"
                title={g.isActive ? '停用' : '啟用'}
              >
                <X size={14} />
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            value={newName}
            onChange={e => setNewName(e.target.value)}
            placeholder="輸入美容師姓名"
            className="flex-1"
            onKeyDown={e => { if (e.key === 'Enter') handleAddGroomer() }}
          />
          <Button onClick={handleAddGroomer} className="bg-primary text-white">
            <Plus size={16} />
          </Button>
        </div>
      </section>

      {/* Topup plans */}
      <section className="bg-white rounded-2xl border border-border-t p-6">
        <h2 className="font-bold text-ink mb-1">儲值方案設定</h2>
        <p className="text-xs text-slate-t mb-4">設定儲值贈送方案，客人在 Kiosk 儲值時會看到</p>
        <TopupPlanEditor />
      </section>

      {/* Topup deduction rule */}
      <section className="bg-white rounded-2xl border border-border-t p-6">
        <h2 className="font-bold text-ink mb-1">儲值折抵規則</h2>
        <div className="flex items-center gap-4 mt-3">
          <label className="text-sm text-ink flex-1">每次最多折抵比例</label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              defaultValue={100}
              min={0}
              max={100}
              className="w-20 h-10 border border-border-t rounded-lg px-3 text-sm text-center"
            />
            <span className="text-slate-t">%</span>
          </div>
        </div>
        <p className="text-xs text-slate-t mt-2">設定 100 = 可全額折抵，設定 50 = 最多折抵一半</p>
        <Button
          onClick={() => toast.success('折抵規則已儲存')}
          className="mt-4 bg-primary text-white"
        >
          儲存
        </Button>
      </section>

      {/* Contract template */}
      <section className="bg-white rounded-2xl border border-border-t p-6">
        <h2 className="font-bold text-ink mb-2">合約範本</h2>
        <p className="text-xs text-slate-t mb-4">
          可用變數：{'{{memberName}}'} {'{{memberPhone}}'} {'{{petName}}'} {'{{petBreed}}'}
          {'{{petWeight}}'} {'{{serviceList}}'} {'{{totalPrice}}'} {'{{serviceDate}}'}
        </p>
        <Textarea
          value={contractTemplate}
          onChange={e => updateContractTemplate(e.target.value)}
          rows={16}
          className="font-mono text-xs"
        />
        <Button
          onClick={() => toast.success('合約範本已儲存')}
          className="mt-4 bg-primary hover:bg-primary-hover text-white"
        >
          儲存合約範本
        </Button>
      </section>
    </div>
  )
}
