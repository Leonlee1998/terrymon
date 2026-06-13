import type { MedicalRecord } from '@/types'
import MedicalRecordCard from './MedicalRecordCard'
import EmptyState from '@/components/shared/EmptyState'

export default function MedicalTab({ records }: { records: MedicalRecord[] }) {
  if (records.length === 0) {
    return <EmptyState icon="🏥" title="還沒有醫療紀錄" subtitle="看診後紀錄會自動同步到這裡" />
  }

  return (
    <div className="relative">
      {/* Timeline line */}
      <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-border-t" />
      <div className="space-y-4 pl-10">
        {records.map((record) => (
          <div key={record.id} className="relative">
            {/* Timeline dot */}
            <div className="absolute -left-[26px] top-4 w-3 h-3 rounded-full bg-primary border-2 border-white shadow-sm" />
            <MedicalRecordCard record={record} />
          </div>
        ))}
      </div>
    </div>
  )
}
