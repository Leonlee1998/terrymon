import { AlertTriangle } from 'lucide-react'
import { MOCK_MEDICAL, MOCK_PETS } from '@/lib/mock'
import { formatDate, calcAge } from '@/lib/utils'
import type { QueueItem } from '@/types'

export default function PatientPanel({ patient }: { patient: QueueItem }) {
  const records = MOCK_MEDICAL.filter(r => r.petId === patient.petId)
  const petInfo = MOCK_PETS.find(p => p.id === patient.petId)

  return (
    <div className="p-5 space-y-4">
      <h2 className="font-bold text-ink text-lg">病患資訊</h2>

      {/* Patient card */}
      <div className="bg-white rounded-2xl border border-border-t p-4">
        <div className="flex items-center gap-3 mb-4">
          {petInfo && (
            <img src={petInfo.photoUrl} alt={patient.petName}
                 className="w-16 h-16 rounded-2xl object-cover" />
          )}
          <div>
            <p className="text-xl font-black text-ink">{patient.petName}</p>
            <p className="text-slate-t">{patient.petBreed}</p>
            {petInfo && <p className="text-xs text-slate-t">{calcAge(petInfo.birthDate)}</p>}
            <p className="text-xs text-slate-t">飼主：{patient.memberName}</p>
          </div>
        </div>

        {/* Today weight */}
        <div className="bg-primary-bg rounded-xl px-4 py-3 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-t">今日體重</p>
            <p className="text-2xl font-black text-primary">{patient.weight} kg</p>
          </div>
          {petInfo && (
            <div className="text-right">
              <p className="text-xs text-slate-t">上次體重</p>
              <p className="font-semibold text-slate-t">{petInfo.weight} kg</p>
              <p className={`text-xs font-medium ${
                patient.weight > petInfo.weight ? 'text-amber-600' :
                patient.weight < petInfo.weight ? 'text-blue-600' : 'text-green-600'
              }`}>
                {patient.weight > petInfo.weight ? '↑' : patient.weight < petInfo.weight ? '↓' : '→'}
                {' '}{Math.abs(patient.weight - petInfo.weight).toFixed(1)} kg
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Allergy */}
      {patient.allergies.length > 0 && (
        <div className="bg-red-50 border-2 border-red-300 rounded-2xl p-4">
          <div className="flex items-center gap-2">
            <AlertTriangle size={20} className="text-red-600" />
            <p className="font-bold text-red-700 text-lg">⚠️ 過敏史</p>
          </div>
          <p className="text-red-700 mt-1">{patient.allergies.join('、')}</p>
          <p className="text-red-600 text-xs mt-1">請確認所有藥品及用品均可安全使用</p>
        </div>
      )}

      {/* Medical history */}
      <div>
        <p className="font-semibold text-ink mb-3 text-sm">歷史病歷</p>
        {records.length === 0 ? (
          <p className="text-slate-t text-sm">無歷史紀錄</p>
        ) : (
          <div className="space-y-2">
            {records.slice(0, 3).map(r => (
              <div key={r.id} className="bg-surface rounded-xl p-3">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-ink text-sm">{r.diagnosis}</p>
                  <p className="text-xs text-slate-t">{formatDate(r.date)}</p>
                </div>
                {r.prescription.length > 0 && (
                  <p className="text-xs text-slate-t mt-1">
                    用藥：{r.prescription.map(p => p.medicine).join('、')}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
