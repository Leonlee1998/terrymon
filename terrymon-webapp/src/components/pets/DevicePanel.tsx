'use client'
import { useState } from 'react'
import { getDeviceIcon, getDeviceLabel, formatTime } from '@/lib/utils'
import { RefreshCw, Wifi, WifiOff, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import type { AIoTDevice } from '@/types'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const DEVICE_TYPES: { value: AIoTDevice['type']; label: string }[] = [
  { value: 'camera',      label: '攝影機' },
  { value: 'glucose',     label: '血糖監測儀' },
  { value: 'bp_monitor',  label: '血壓計' },
  { value: 'thermometer', label: '體溫計' },
  { value: 'scale',       label: '體重計' },
]

export default function DevicePanel({ devices }: { devices: AIoTDevice[] }) {
  const [localDevices, setLocalDevices] = useState<AIoTDevice[]>([])
  const [addOpen, setAddOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ name: '', type: 'camera' as AIoTDevice['type'] })

  const allDevices = [...devices, ...localDevices]

  async function handleAdd() {
    if (!form.name.trim()) return
    setSaving(true)
    await new Promise(r => setTimeout(r, 600))
    const newDevice: AIoTDevice = {
      id: `DEV_${Date.now()}`,
      petId: devices[0]?.petId ?? 'P001',
      name: form.name.trim(),
      type: form.type,
      status: 'offline',
      lastSeen: new Date().toISOString(),
      batteryLevel: 100,
    }
    setLocalDevices(prev => [...prev, newDevice])
    setSaving(false)
    setAddOpen(false)
    setForm({ name: '', type: 'camera' })
    toast.success(`${newDevice.name} 已新增，請依說明書完成配對`)
  }

  return (
    <div className="space-y-3">
      {allDevices.map(device => (
        <div key={device.id} className="bg-white rounded-2xl border border-border-t p-4">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl ${
              device.status === 'online' ? 'bg-primary-bg' :
              device.status === 'error'  ? 'bg-red-50' : 'bg-surface'
            }`}>
              {getDeviceIcon(device.type)}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="font-semibold text-ink text-sm">{device.name}</p>
                {device.status === 'online'  && <Wifi size={14} className="text-primary" />}
                {device.status === 'offline' && <WifiOff size={14} className="text-slate-t" />}
                {device.status === 'error'   && <AlertCircle size={14} className="text-red-500" />}
              </div>
              <p className="text-xs text-slate-t">{getDeviceLabel(device.type)}</p>
              <p className="text-xs text-slate-t mt-0.5">
                最後更新：{formatTime(device.lastSeen)}
              </p>
            </div>
            <div className="text-right">
              {device.batteryLevel !== undefined && (
                <div className="flex flex-col items-end gap-1">
                  <p className="text-xs font-medium text-ink">{device.batteryLevel}%</p>
                  <div className="w-12 h-1.5 bg-border-t rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${device.batteryLevel > 20 ? 'bg-primary' : 'bg-red-500'}`}
                      style={{ width: `${device.batteryLevel}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {device.status === 'offline' && (
            <div className="mt-2 flex items-center justify-between bg-surface rounded-lg px-3 py-2">
              <p className="text-xs text-slate-t">裝置已離線，請確認電源和網路連線</p>
              <button
                onClick={() => toast.info('正在嘗試重新連線...')}
                className="text-primary ml-2"
              >
                <RefreshCw size={14} />
              </button>
            </div>
          )}
          {device.status === 'error' && (
            <div className="mt-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              <p className="text-xs text-red-700">裝置發生異常，請聯繫客服</p>
            </div>
          )}
          {device.batteryLevel !== undefined && device.batteryLevel <= 20 && (
            <div className="mt-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
              <p className="text-xs text-amber-700">電量低，請盡快為裝置充電</p>
            </div>
          )}
        </div>
      ))}

      <button
        onClick={() => { setForm({ name: '', type: 'camera' }); setAddOpen(true) }}
        className="w-full border-2 border-dashed border-border-t rounded-2xl py-4 text-slate-t text-sm hover:border-primary hover:text-primary transition-colors"
      >
        ＋ 新增 AIoT 裝置
      </button>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>新增 AIoT 裝置</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <label className="text-sm font-medium text-ink block mb-1">裝置名稱 *</label>
              <Input
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="小怪獸的攝影機"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-ink block mb-1">裝置類型</label>
              <select
                value={form.type}
                onChange={e => setForm(f => ({ ...f, type: e.target.value as AIoTDevice['type'] }))}
                className="w-full border border-input rounded-md px-3 py-2 text-sm bg-white"
              >
                {DEVICE_TYPES.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            <div className="bg-surface rounded-xl px-3 py-2 text-xs text-slate-t">
              新增後裝置將顯示為「離線」狀態，請依說明書完成 Wi-Fi 配對。
            </div>
            <Button
              onClick={handleAdd}
              disabled={saving || !form.name.trim()}
              className="w-full bg-primary hover:bg-primary-hover text-white"
            >
              {saving ? '新增中…' : '新增裝置'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
