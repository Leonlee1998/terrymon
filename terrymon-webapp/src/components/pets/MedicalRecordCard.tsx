'use client'
import { useState } from 'react'
import { ChevronDown, ChevronUp, FileText, Receipt, ClipboardList } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { toast } from 'sonner'
import type { MedicalRecord } from '@/types'

export default function MedicalRecordCard({ record }: { record: MedicalRecord }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="bg-white rounded-2xl border border-border-t overflow-hidden">
      {/* Header（always visible）*/}
      <button
        className="w-full flex items-start gap-3 p-4 text-left"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-slate-t">{formatDate(record.date)}</span>
            {record.nextVisitDate && (
              <span className="text-[10px] bg-primary-bg text-primary px-1.5 py-0.5 rounded-full">
                回診 {formatDate(record.nextVisitDate)}
              </span>
            )}
          </div>
          <p className="font-semibold text-ink mt-0.5">{record.diagnosis}</p>
          <p className="text-xs text-slate-t mt-0.5">{record.clinicName} · {record.doctorName}</p>
        </div>
        {expanded
          ? <ChevronUp size={18} className="text-slate-t flex-shrink-0 mt-1" />
          : <ChevronDown size={18} className="text-slate-t flex-shrink-0 mt-1" />
        }
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="border-t border-border-t px-4 pb-4 space-y-3">
          {/* Chief complaint */}
          <div className="pt-3">
            <p className="text-xs font-semibold text-slate-t mb-1">主訴</p>
            <p className="text-sm text-ink">{record.chiefComplaint}</p>
          </div>

          {/* Diagnosis + Treatment */}
          <div>
            <p className="text-xs font-semibold text-slate-t mb-1">診斷與處置</p>
            <p className="text-sm text-ink">{record.treatment}</p>
          </div>

          {/* Prescription */}
          {record.prescription.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-slate-t mb-2">用藥</p>
              <div className="rounded-xl overflow-hidden border border-border-t">
                <div className="grid grid-cols-4 gap-2 px-3 py-2 bg-surface text-[11px] font-semibold text-slate-t">
                  <span>藥品</span><span>劑量</span><span>頻率</span><span>天數</span>
                </div>
                {record.prescription.map((rx, i) => (
                  <div
                    key={i}
                    className="grid grid-cols-4 gap-2 px-3 py-2 text-xs text-ink border-t border-border-t"
                  >
                    <span className="font-medium">{rx.medicine}</span>
                    <span>{rx.dosage}</span>
                    <span>{rx.frequency}</span>
                    <span>{rx.days} 天</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Document buttons */}
          <div className="flex gap-2 flex-wrap">
            {record.prescriptionUrl && (
              <button
                onClick={() => toast.info('開啟藥單文件')}
                className="flex items-center gap-1.5 text-xs border border-border-t rounded-lg px-3 py-1.5 text-ink hover:border-primary hover:text-primary transition-colors"
              >
                <ClipboardList size={14} />
                藥單
              </button>
            )}
            {record.receiptUrl && (
              <button
                onClick={() => toast.info('開啟收據文件')}
                className="flex items-center gap-1.5 text-xs border border-border-t rounded-lg px-3 py-1.5 text-ink hover:border-primary hover:text-primary transition-colors"
              >
                <Receipt size={14} />
                收據
              </button>
            )}
            {record.reportUrl && (
              <button
                onClick={() => toast.info('開啟報告文件')}
                className="flex items-center gap-1.5 text-xs border border-border-t rounded-lg px-3 py-1.5 text-ink hover:border-primary hover:text-primary transition-colors"
              >
                <FileText size={14} />
                檢查報告
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
