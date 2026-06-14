import { Activity, AlertTriangle, BatteryLow, CheckCircle2, HeartPulse, Scale, Thermometer } from 'lucide-react'
import type { AIoTDevice, HealthDataPoint, Pet, PetHealthData } from '@/types'
import { formatDate } from '@/lib/utils'

type AlertTone = 'ok' | 'warn' | 'danger'

type HealthAlert = {
  title: string
  detail: string
  tone: AlertTone
  icon: typeof AlertTriangle
}

function latest(data: HealthDataPoint[]) {
  return data.length ? data[data.length - 1] : null
}

function diff(data: HealthDataPoint[]) {
  if (data.length < 2) return 0
  return data[data.length - 1].value - data[data.length - 2].value
}

function toneClass(tone: AlertTone) {
  if (tone === 'danger') return 'border-red-200 bg-red-50 text-red-700'
  if (tone === 'warn') return 'border-amber-200 bg-amber-50 text-amber-700'
  return 'border-emerald-200 bg-emerald-50 text-emerald-700'
}

function buildAlerts(pet: Pet, healthData: PetHealthData, devices: AIoTDevice[]): HealthAlert[] {
  const alerts: HealthAlert[] = []
  const weight = latest(healthData.weight)
  const weightChange = diff(healthData.weight)
  const glucose = latest(healthData.bloodSugar)
  const heartRate = latest(healthData.heartRate)
  const temperature = latest(healthData.temperature)
  const offlineDevices = devices.filter(device => device.status !== 'online')
  const lowBatteryDevices = devices.filter(device => (device.batteryLevel ?? 100) <= 20)

  if (pet.allergies.length > 0) {
    alerts.push({
      title: '過敏提醒',
      detail: pet.allergies.join('、'),
      tone: 'danger',
      icon: AlertTriangle,
    })
  }

  if (weight && Math.abs(weightChange) >= 0.3) {
    alerts.push({
      title: weightChange > 0 ? '體重上升' : '體重下降',
      detail: `最近一次 ${weight.value}${weight.unit || 'kg'}，較前次${weightChange > 0 ? '增加' : '減少'} ${Math.abs(weightChange).toFixed(1)} kg`,
      tone: 'warn',
      icon: Scale,
    })
  }

  if (glucose && glucose.value >= 130) {
    alerts.push({
      title: '血糖偏高',
      detail: `最近一次 ${glucose.value}${glucose.unit || 'mg/dL'}，建議持續觀察飲食與活動量。`,
      tone: 'warn',
      icon: Activity,
    })
  }

  if (heartRate && (heartRate.value > 140 || heartRate.value < 60)) {
    alerts.push({
      title: '心率需要留意',
      detail: `最近一次 ${heartRate.value}${heartRate.unit || 'bpm'}，若持續異常建議諮詢獸醫。`,
      tone: 'warn',
      icon: HeartPulse,
    })
  }

  if (temperature && (temperature.value >= 39.5 || temperature.value <= 37.2)) {
    alerts.push({
      title: '體溫需要留意',
      detail: `最近一次 ${temperature.value}${temperature.unit || '°C'}，請確認量測狀態。`,
      tone: 'warn',
      icon: Thermometer,
    })
  }

  if (offlineDevices.length > 0) {
    alerts.push({
      title: '裝置離線',
      detail: `${offlineDevices.map(device => device.name).join('、')} 目前未連線。`,
      tone: 'warn',
      icon: AlertTriangle,
    })
  }

  if (lowBatteryDevices.length > 0) {
    alerts.push({
      title: '裝置電量偏低',
      detail: `${lowBatteryDevices.map(device => device.name).join('、')} 建議充電或更換電池。`,
      tone: 'warn',
      icon: BatteryLow,
    })
  }

  if (alerts.length === 0) {
    alerts.push({
      title: '目前狀態穩定',
      detail: '沒有需要立即處理的健康提醒。',
      tone: 'ok',
      icon: CheckCircle2,
    })
  }

  return alerts.slice(0, 4)
}

export default function HealthAlertCard({
  pet,
  healthData,
  devices,
}: {
  pet: Pet
  healthData: PetHealthData
  devices: AIoTDevice[]
}) {
  const alerts = buildAlerts(pet, healthData, devices)
  const lastWeight = latest(healthData.weight)

  return (
    <section className="rounded-xl border border-border-t bg-white p-4">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-ink">健康提醒</h2>
          <p className="mt-0.5 text-xs text-slate-t">
            {lastWeight ? `最後更新 ${formatDate(lastWeight.timestamp)}` : '尚未有健康量測資料'}
          </p>
        </div>
        <span className="rounded-full bg-primary-bg px-3 py-1 text-xs font-semibold text-primary">
          {alerts.filter(alert => alert.tone !== 'ok').length || 0} 項注意
        </span>
      </div>

      <div className="space-y-2">
        {alerts.map(alert => {
          const Icon = alert.icon
          return (
            <div key={`${alert.title}-${alert.detail}`} className={`flex gap-3 rounded-xl border px-3 py-2.5 ${toneClass(alert.tone)}`}>
              <Icon size={18} className="mt-0.5 shrink-0" />
              <div className="min-w-0">
                <p className="text-sm font-bold">{alert.title}</p>
                <p className="mt-0.5 text-xs leading-5 opacity-90">{alert.detail}</p>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
