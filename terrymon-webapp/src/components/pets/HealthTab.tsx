'use client'
import { useState } from 'react'
import type { PetHealthData, AIoTDevice, Pet } from '@/types'
import WeightChart from './charts/WeightChart'
import BloodSugarChart from './charts/BloodSugarChart'
import BloodPressureChart from './charts/BloodPressureChart'
import HeartRateChart from './charts/HeartRateChart'
import DevicePanel from './DevicePanel'
import CameraView from './CameraView'

interface Props { healthData: PetHealthData; devices: AIoTDevice[]; pet: Pet }

type DataView = 'overview' | 'weight' | 'glucose' | 'bp' | 'hr' | 'devices'

export default function HealthTab({ healthData, devices, pet }: Props) {
  const [view, setView] = useState<DataView>('overview')

  const viewTabs: { key: DataView; label: string; emoji: string }[] = [
    { key: 'overview', label: '總覽',   emoji: '📊' },
    { key: 'weight',   label: '體重',   emoji: '⚖️' },
    { key: 'glucose',  label: '血糖',   emoji: '🩸' },
    { key: 'bp',       label: '血壓',   emoji: '💓' },
    { key: 'hr',       label: '心率',   emoji: '❤️' },
    { key: 'devices',  label: '裝置',   emoji: '📡' },
  ]

  return (
    <div className="space-y-4">
      {/* View selector */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {viewTabs.map(t => (
          <button
            key={t.key}
            onClick={() => setView(t.key)}
            className={`flex-shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              view === t.key
                ? 'bg-primary text-white'
                : 'bg-white border border-border-t text-slate-t hover:border-primary'
            }`}
          >
            <span>{t.emoji}</span>
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      {view === 'overview' && (
        <div className="space-y-4">
          <WeightChart data={healthData.weight} compact />
          <BloodSugarChart data={healthData.bloodSugar} compact />
          <CameraView devices={devices} />
        </div>
      )}
      {view === 'weight'  && <WeightChart data={healthData.weight} />}
      {view === 'glucose' && <BloodSugarChart data={healthData.bloodSugar} />}
      {view === 'bp'      && <BloodPressureChart sys={healthData.bloodPressureSys} dia={healthData.bloodPressureDia} />}
      {view === 'hr'      && <HeartRateChart data={healthData.heartRate} />}
      {view === 'devices' && <DevicePanel devices={devices} />}
    </div>
  )
}
