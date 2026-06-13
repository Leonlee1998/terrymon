'use client'
import { useState } from 'react'
import { toast } from 'sonner'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Plus, Pencil } from 'lucide-react'
import { MOCK_MAIN_SERVICES, MOCK_ADDON_SERVICES } from '@/lib/mock'
import type { GroomingService } from '@/types'
import ServiceDialog from '@/components/admin/ServiceDialog'

export default function ServicesPage() {
  const [services, setServices] = useState<GroomingService[]>([
    ...MOCK_MAIN_SERVICES, ...MOCK_ADDON_SERVICES,
  ])
  const [editTarget, setEditTarget] = useState<GroomingService | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const main = services.filter(s => !s.isAddon)
  const addon = services.filter(s => s.isAddon)

  function toggleEnabled(id: string) {
    setServices(prev => prev.map(s => s.id === id ? { ...s, enabled: !s.enabled } : s))
  }

  function handleEdit(service: GroomingService) {
    setEditTarget(service)
    setDialogOpen(true)
  }

  function handleAdd() {
    setEditTarget(null)
    setDialogOpen(true)
  }

  function handleSave(data: Omit<GroomingService, 'id'>) {
    if (editTarget) {
      setServices(prev => prev.map(s => s.id === editTarget.id ? { ...s, ...data } : s))
    } else {
      setServices(prev => [...prev, { id: `GS${Date.now()}`, ...data }])
    }
    toast.success('儲存成功')
    setDialogOpen(false)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-ink">服務項目</h1>
        <Button onClick={handleAdd} className="bg-primary hover:bg-primary-hover text-white">
          <Plus size={16} className="mr-1" />新增服務
        </Button>
      </div>

      <Tabs defaultValue="main">
        <TabsList className="mb-4">
          <TabsTrigger value="main">主要服務</TabsTrigger>
          <TabsTrigger value="addon">加值服務</TabsTrigger>
        </TabsList>
        <TabsContent value="main">
          <ServiceTable services={main} onToggle={toggleEnabled} onEdit={handleEdit} />
        </TabsContent>
        <TabsContent value="addon">
          <ServiceTable services={addon} onToggle={toggleEnabled} onEdit={handleEdit} />
        </TabsContent>
      </Tabs>

      <ServiceDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editTarget={editTarget}
        onSave={handleSave}
      />
    </div>
  )
}

function ServiceTable({
  services, onToggle, onEdit,
}: {
  services: GroomingService[]
  onToggle: (id: string) => void
  onEdit: (s: GroomingService) => void
}) {
  return (
    <div className="bg-surface border border-border-t rounded-xl overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 border-b border-border-t text-slate-t">
          <tr>
            <th className="text-left px-4 py-3 font-medium">名稱</th>
            <th className="text-left px-4 py-3 font-medium">說明</th>
            <th className="text-left px-4 py-3 font-medium">價格</th>
            <th className="text-left px-4 py-3 font-medium">時長</th>
            <th className="text-left px-4 py-3 font-medium">狀態</th>
            <th className="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border-t">
          {services.map(s => (
            <tr key={s.id}>
              <td className="px-4 py-3 font-medium text-ink">{s.name}</td>
              <td className="px-4 py-3 text-slate-t">{s.description}</td>
              <td className="px-4 py-3 text-ink">NT$ {s.price}</td>
              <td className="px-4 py-3 text-slate-t">{s.duration} 分鐘</td>
              <td className="px-4 py-3">
                <Switch checked={s.enabled} onCheckedChange={() => onToggle(s.id)} />
              </td>
              <td className="px-4 py-3">
                <Button variant="ghost" size="sm" onClick={() => onEdit(s)}>
                  <Pencil size={14} />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
