import { FileText } from 'lucide-react'
import type { MedicalRecord } from '@/types'
import MedicalRecordCard from './MedicalRecordCard'

export default function MedicalTab({ records }: { records: MedicalRecord[] }) {
  if (records.length === 0) {
    return (
      <div className="rounded-xl border border-border-t bg-white px-4 py-10 text-center">
        <FileText size={34} className="mx-auto text-slate-t" />
        <p className="mt-3 font-bold text-ink">尚無醫療紀錄</p>
        <p className="mx-auto mt-1 max-w-sm text-sm leading-6 text-slate-t">
          看診完成後，病歷、處方、收據與回診提醒會集中在這裡。
        </p>
      </div>
    )
  }

  return (
    <div className="relative">
      <div className="absolute bottom-4 left-4 top-4 w-0.5 bg-border-t" />
      <div className="space-y-4 pl-10">
        {records.map(record => (
          <div key={record.id} className="relative">
            <div className="absolute -left-[26px] top-4 h-3 w-3 rounded-full border-2 border-white bg-primary shadow-sm" />
            <MedicalRecordCard record={record} />
          </div>
        ))}
      </div>
    </div>
  )
}
