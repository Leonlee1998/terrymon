import type { Pet, PetHealthData } from '@/types'
import { AlertTriangle } from 'lucide-react'

interface Props { pet: Pet; healthData: PetHealthData }

export default function HealthAlerts({ pet, healthData }: Props) {
  const alerts: string[] = []

  const lastSugar = healthData.bloodSugar.at(-1)
  if (lastSugar && lastSugar.value > 5.2) {
    alerts.push(`${pet.name} 最新血糖偏高（${lastSugar.value} mmol/L），建議諮詢獸醫`)
  }

  const lastBP = healthData.bloodPressureSys.at(-1)
  if (lastBP && lastBP.value > 130) {
    alerts.push(`${pet.name} 收縮壓偏高（${lastBP.value} mmHg）`)
  }

  if (alerts.length === 0) return null

  return (
    <div className="space-y-2">
      {alerts.map((alert, i) => (
        <div key={i} className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-3">
          <AlertTriangle size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-amber-800">{alert}</p>
        </div>
      ))}
    </div>
  )
}
