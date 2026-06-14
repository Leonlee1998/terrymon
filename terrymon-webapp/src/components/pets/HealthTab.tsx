'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Activity, Camera, Gauge, HeartPulse, Plus, Scale, Smartphone } from 'lucide-react'
import type { AIoTDevice, Pet, PetHealthData } from '@/types'
import WeightChart from './charts/WeightChart'
import BloodSugarChart from './charts/BloodSugarChart'
import BloodPressureChart from './charts/BloodPressureChart'
import HeartRateChart from './charts/HeartRateChart'
import DevicePanel from './DevicePanel'
import CameraView from './CameraView'
import AddHealthDialog from './AddHealthDialog'

interface Props {
  healthData: PetHealthData
  devices: AIoTDevice[]
  pet: Pet
}

type DataView = 'overview' | 'weight' | 'glucose' | 'bp' | 'hr' | 'devices'

const viewTabs: { key: DataView; label: string; icon: typeof Activity }[] = [
  { key: 'overview', label: '總覽', icon: Activity },
  { key: 'weight', label: '體重', icon: Scale },
  { key: 'glucose', label: '血糖', icon: Gauge },
  { key: 'bp', label: '血壓', icon: HeartPulse },
  { key: 'hr', label: '心率', icon: Activity },
  { key: 'devices', label: '裝置', icon: Smartphone },
]

export default function HealthTab({ healthData, devices, pet }: Props) {
  const router = useRouter()
  const [view, setView] = useState<DataView>('overview')
  const [addOpen, setAddOpen] = useState(false)

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="flex flex-1 gap-2 overflow-x-auto pb-1">
          {viewTabs.map(tab => {
            const Icon = tab.icon
            return (
              <button
                key={tab.key}
                onClick={() => setView(tab.key)}
                className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                  view === tab.key
                    ? 'bg-primary text-white'
                    : 'border border-border-t bg-white text-slate-t hover:border-primary hover:text-primary'
                }`}
              >
                <Icon size={14} />
                {tab.label}
              </button>
            )
          })}
        </div>
        <button
          onClick={() => setAddOpen(true)}
          className="flex shrink-0 items-center gap-1 rounded-full border border-border-t bg-white px-2.5 py-1.5 text-xs font-semibold text-ink transition-colors hover:border-primary hover:text-primary"
        >
          <Plus size={13} />
          新增
        </button>
      </div>

      {view === 'overview' && (
        <div className="space-y-4">
          <WeightChart data={healthData.weight} compact />
          <BloodSugarChart data={healthData.bloodSugar} compact />
          {devices.some(device => device.type === 'camera') ? (
            <CameraView devices={devices} />
          ) : (
            <div className="rounded-xl border border-border-t bg-white p-4 text-sm text-slate-t">
              <div className="mb-2 flex items-center gap-2 font-semibold text-ink">
                <Camera size={17} />
                攝影機
              </div>
              尚未綁定攝影機。
            </div>
          )}
        </div>
      )}
      {view === 'weight' && <WeightChart data={healthData.weight} />}
      {view === 'glucose' && <BloodSugarChart data={healthData.bloodSugar} />}
      {view === 'bp' && <BloodPressureChart sys={healthData.bloodPressureSys} dia={healthData.bloodPressureDia} />}
      {view === 'hr' && <HeartRateChart data={healthData.heartRate} />}
      {view === 'devices' && <DevicePanel devices={devices} />}

      <AddHealthDialog
        petId={pet.id}
        open={addOpen}
        onOpenChange={setAddOpen}
        onSaved={() => router.refresh()}
      />
    </div>
  )
}
