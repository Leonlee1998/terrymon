'use client'
/* eslint-disable react-hooks/static-components */
import { useState } from 'react'
import { Plus, ChevronDown, ChevronUp } from 'lucide-react'
import { useAdminStore } from '@/stores/adminStore'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { WEIGHT_RANGES, GROOMER_RANK_CONFIG } from '@/lib/mock'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import ServiceEditDialog from '@/components/admin/ServiceEditDialog'
import BreedManagerDialog from '@/components/admin/BreedManagerDialog'
import type { GroomingService } from '@/types'
import { formatPrice } from '@/lib/utils'

// GROOMER_RANK_CONFIG available for groomer-related panels
void GROOMER_RANK_CONFIG

export default function AdminServices() {
  const { services, toggleService } = useAdminStore()
  const [editTarget, setEditTarget] = useState<GroomingService | null>(null)
  const [isNew, setIsNew] = useState(false)
  const [newCategory, setNewCategory] = useState<'main' | 'addon' | 'package'>('main')
  const [breedMgrOpen, setBreedMgrOpen] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const mainSvs    = services.filter(s => s.category === 'main')
  const addonSvs   = services.filter(s => s.category === 'addon')
  const packageSvs = services.filter(s => s.category === 'package')

  function handleNew(category: 'main' | 'addon' | 'package') {
    setNewCategory(category)
    setIsNew(true)
    setEditTarget(null)
  }

  const ServiceRow = ({ service }: { service: GroomingService }) => {
    const isExpanded = expandedId === service.id

    const prices = service.priceMatrix.map(m => m.regularPrice)
    const priceRange = prices.length
      ? prices.length === 1
        ? formatPrice(prices[0])
        : `${formatPrice(Math.min(...prices))} ～ ${formatPrice(Math.max(...prices))}`
      : '—'

    return (
      <div className="border-b border-border-t last:border-0">
        <div className="flex items-center gap-4 px-5 py-4">
          <Switch
            checked={service.isEnabled}
            onCheckedChange={() => toggleService(service.id)}
          />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <p className="font-semibold text-ink">{service.name}</p>
              {service.category === 'package' && service.packageDiscountPct && (
                <span className="text-[11px] bg-accent text-white px-2 py-0.5 rounded-full font-bold">
                  {service.packageDiscountPct}折
                </span>
              )}
            </div>
            <p className="text-xs text-slate-t mt-0.5">{service.description}</p>
          </div>
          <div className="text-right">
            <p className="font-semibold text-primary text-sm">{priceRange}</p>
            <p className="text-xs text-slate-t">{service.priceMatrix.length} 個定價</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => { setEditTarget(service); setIsNew(false) }}
              className="text-xs text-primary border border-primary/30 rounded-lg px-3 py-1.5 hover:bg-primary-bg"
            >
              編輯
            </button>
            <button
              onClick={() => setExpandedId(isExpanded ? null : service.id)}
              className="text-slate-t hover:text-ink"
            >
              {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>
          </div>
        </div>

        {isExpanded && service.priceMatrix.length > 0 && (
          <div className="px-5 pb-4 overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-surface">
                  <th className="text-left px-3 py-2 text-slate-t font-semibold rounded-tl-lg">體型 / 毛長</th>
                  <th className="px-3 py-2 text-slate-t font-semibold">一般價</th>
                  <th className="px-3 py-2 text-slate-t font-semibold">會員價</th>
                  <th className="px-3 py-2 text-slate-t font-semibold">儲值價</th>
                  <th className="px-3 py-2 text-slate-t font-semibold rounded-tr-lg">時長</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-t">
                {service.priceMatrix.map((m, i) => {
                  const range = WEIGHT_RANGES.find(r => r.id === m.weightRangeId)
                  const coatLabel: Record<string, string> = {
                    short: '短毛', medium: '中毛', long: '長毛',
                    double: '雙層毛', wire: '鋼毛',
                  }
                  return (
                    <tr key={i} className="hover:bg-surface/50">
                      <td className="px-3 py-2 font-medium text-ink">
                        {range?.label} × {coatLabel[m.coatLength] ?? m.coatLength}
                      </td>
                      <td className="px-3 py-2 text-center">{formatPrice(m.regularPrice)}</td>
                      <td className="px-3 py-2 text-center text-blue-600">{formatPrice(m.memberPrice)}</td>
                      <td className="px-3 py-2 text-center text-primary font-semibold">{formatPrice(m.balancePrice)}</td>
                      <td className="px-3 py-2 text-center text-slate-t">{m.durationMin} min</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    )
  }

  const ServiceSection = ({ items, category }: { items: GroomingService[]; category: 'main' | 'addon' | 'package' }) => (
    <div>
      <div className="bg-white rounded-2xl border border-border-t overflow-hidden mb-4">
        {items.length === 0 ? (
          <p className="text-center text-slate-t py-8 text-sm">尚無服務，點下方新增</p>
        ) : (
          items.map(s => <ServiceRow key={s.id} service={s} />)
        )}
      </div>
      <Button variant="outline" onClick={() => handleNew(category)} className="w-full border-dashed">
        <Plus size={16} className="mr-2" />
        新增{category === 'main' ? '主要' : category === 'addon' ? '加值' : '套組'}服務
      </Button>
    </div>
  )

  return (
    <div className="p-6">
      <AdminPageHeader
        title="服務管理"
        subtitle="設定服務項目、定價矩陣與套組"
        action={
          <Button
            variant="outline"
            onClick={() => setBreedMgrOpen(true)}
            className="border-border-t text-slate-t"
          >
            品種庫管理
          </Button>
        }
      />

      <Tabs defaultValue="main">
        <TabsList className="mb-6 grid grid-cols-3 w-full max-w-sm">
          <TabsTrigger value="main">主要服務 ({mainSvs.length})</TabsTrigger>
          <TabsTrigger value="addon">加值服務 ({addonSvs.length})</TabsTrigger>
          <TabsTrigger value="package">套組 ({packageSvs.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="main"><ServiceSection items={mainSvs} category="main" /></TabsContent>
        <TabsContent value="addon"><ServiceSection items={addonSvs} category="addon" /></TabsContent>
        <TabsContent value="package"><ServiceSection items={packageSvs} category="package" /></TabsContent>
      </Tabs>

      <ServiceEditDialog
        open={!!editTarget || isNew}
        service={editTarget}
        defaultCategory={newCategory}
        onClose={() => { setEditTarget(null); setIsNew(false) }}
      />

      <BreedManagerDialog open={breedMgrOpen} onClose={() => setBreedMgrOpen(false)} />
    </div>
  )
}
