import type { Pet, AIoTDevice, PetHealthData } from '@/types'
import { getDeviceIcon, getDeviceLabel, getTrend, formatTime } from '@/lib/utils'
import Link from 'next/link'

interface Props { pet: Pet; devices: AIoTDevice[]; healthData: PetHealthData }

export default function AIoTDashboard({ pet, devices, healthData }: Props) {
  const lastWeight = healthData.weight.at(-1)
  const lastSugar  = healthData.bloodSugar.at(-1)
  const lastBP     = healthData.bloodPressureSys.at(-1)
  const lastHR     = healthData.heartRate.at(-1)

  const metrics = [
    {
      label: '體重', value: lastWeight ? `${lastWeight.value} kg` : '—',
      trend: getTrend(healthData.weight), color: 'text-primary',
    },
    {
      label: '血糖', value: lastSugar ? `${lastSugar.value}` : '—',
      unit: 'mmol/L', trend: getTrend(healthData.bloodSugar),
      color: lastSugar && lastSugar.value > 5.2 ? 'text-amber-600' : 'text-primary',
    },
    {
      label: '血壓', value: lastBP ? `${lastBP.value}` : '—',
      unit: 'mmHg', trend: getTrend(healthData.bloodPressureSys),
      color: lastBP && lastBP.value > 130 ? 'text-red-500' : 'text-primary',
    },
    {
      label: '心率', value: lastHR ? `${lastHR.value}` : '—',
      unit: 'bpm', trend: getTrend(healthData.heartRate), color: 'text-primary',
    },
  ]

  return (
    <div className="bg-white rounded-2xl border border-border-t p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-ink">{pet.name} 的健康監控</h3>
          <p className="text-xs text-slate-t mt-0.5">AIoT 即時數據</p>
        </div>
        <Link href="/pets" className="text-xs text-primary">查看詳情</Link>
      </div>

      {/* Metrics grid */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        {metrics.map(m => (
          <div key={m.label} className="bg-surface rounded-xl p-3">
            <p className="text-xs text-slate-t">{m.label}</p>
            <div className="flex items-baseline gap-1 mt-1">
              <span className={`text-xl font-bold ${m.color}`}>{m.value}</span>
              {m.unit && <span className="text-xs text-slate-t">{m.unit}</span>}
              <span className={`text-sm ml-auto ${
                m.trend === '↑' ? 'text-amber-500' :
                m.trend === '↓' ? 'text-blue-500' : 'text-slate-t'
              }`}>{m.trend}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Devices */}
      <div>
        <p className="text-xs font-medium text-slate-t mb-2">連接的裝置</p>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {devices.map(d => (
            <div
              key={d.id}
              className={`flex-shrink-0 flex flex-col items-center gap-1 p-2.5 rounded-xl border min-w-[72px] ${
                d.status === 'online'
                  ? 'border-primary/30 bg-primary-bg'
                  : d.status === 'offline'
                  ? 'border-border-t bg-surface'
                  : 'border-red-200 bg-red-50'
              }`}
            >
              <span className="text-xl">{getDeviceIcon(d.type)}</span>
              <span className="text-xs font-medium text-ink text-center leading-tight">
                {getDeviceLabel(d.type)}
              </span>
              <span className={`text-[10px] ${
                d.status === 'online' ? 'text-primary' :
                d.status === 'offline' ? 'text-slate-t' : 'text-red-500'
              }`}>
                {d.status === 'online' ? '● 在線' :
                 d.status === 'offline' ? '○ 離線' : '✕ 異常'}
              </span>
              {d.batteryLevel !== undefined && (
                <span className="text-[10px] text-slate-t">{d.batteryLevel}%</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Camera preview */}
      {devices.find(d => d.type === 'camera' && d.status === 'online') && (
        <div className="mt-3 rounded-xl overflow-hidden border border-border-t">
          <div className="bg-gray-900 aspect-video flex items-center justify-center relative">
            <span className="text-white/50 text-sm">📷 攝影機即時畫面</span>
            <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
              LIVE
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
