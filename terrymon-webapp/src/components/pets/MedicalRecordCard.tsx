'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, ClipboardList, FileText, Receipt } from 'lucide-react'
import type { MedicalRecord } from '@/types'
import { formatDate } from '@/lib/utils'

export default function MedicalRecordCard({ record }: { record: MedicalRecord }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <article className="overflow-hidden rounded-xl border border-border-t bg-white">
      <button
        className="flex w-full items-start gap-3 p-4 text-left"
        onClick={() => setExpanded(value => !value)}
      >
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-t">{formatDate(record.date)}</span>
            {record.nextVisitDate && (
              <span className="rounded-full bg-primary-bg px-2 py-0.5 text-[10px] font-semibold text-primary">
                回診 {formatDate(record.nextVisitDate)}
              </span>
            )}
          </div>
          <p className="mt-1 font-bold text-ink">{record.diagnosis || '診斷未記錄'}</p>
          <p className="mt-0.5 text-xs text-slate-t">
            {record.clinicName || '診所未記錄'} · {record.doctorName || '醫師未記錄'}
          </p>
        </div>
        {expanded ? (
          <ChevronUp size={18} className="mt-1 shrink-0 text-slate-t" />
        ) : (
          <ChevronDown size={18} className="mt-1 shrink-0 text-slate-t" />
        )}
      </button>

      {expanded && (
        <div className="space-y-3 border-t border-border-t px-4 pb-4">
          <InfoBlock title="主訴" value={record.chiefComplaint || '未記錄'} />
          <InfoBlock title="治療與處置" value={record.treatment || '未記錄'} />

          {record.prescription.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-semibold text-slate-t">處方</p>
              <div className="overflow-hidden rounded-xl border border-border-t">
                <div className="grid grid-cols-4 gap-2 bg-surface px-3 py-2 text-[11px] font-semibold text-slate-t">
                  <span>藥品</span>
                  <span>劑量</span>
                  <span>頻率</span>
                  <span>天數</span>
                </div>
                {record.prescription.map((rx, index) => (
                  <div key={`${rx.medicine}-${index}`} className="grid grid-cols-4 gap-2 border-t border-border-t px-3 py-2 text-xs text-ink">
                    <span className="font-semibold">{rx.medicine}</span>
                    <span>{rx.dosage}</span>
                    <span>{rx.frequency}</span>
                    <span>{rx.days} 天</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            {record.prescriptionUrl && (
              <DocumentButton icon={ClipboardList} label="處方" onClick={() => window.open(record.prescriptionUrl!, '_blank', 'noopener,noreferrer')} />
            )}
            {record.receiptUrl && (
              <DocumentButton icon={Receipt} label="收據" onClick={() => window.open(record.receiptUrl!, '_blank', 'noopener,noreferrer')} />
            )}
            {record.reportUrl && (
              <DocumentButton icon={FileText} label="報告" onClick={() => window.open(record.reportUrl!, '_blank', 'noopener,noreferrer')} />
            )}
          </div>
        </div>
      )}
    </article>
  )
}

function InfoBlock({ title, value }: { title: string; value: string }) {
  return (
    <div className="pt-3">
      <p className="mb-1 text-xs font-semibold text-slate-t">{title}</p>
      <p className="text-sm leading-6 text-ink">{value}</p>
    </div>
  )
}

function DocumentButton({
  icon: Icon,
  label,
  onClick,
}: {
  icon: typeof FileText
  label: string
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 rounded-lg border border-border-t px-3 py-1.5 text-xs font-medium text-ink transition-colors hover:border-primary hover:text-primary"
    >
      <Icon size={14} />
      {label}
    </button>
  )
}
