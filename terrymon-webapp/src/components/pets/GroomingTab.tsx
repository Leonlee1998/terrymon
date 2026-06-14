import { Camera, FileText, Receipt, Scissors } from 'lucide-react'
import { toast } from 'sonner'
import type { GroomingRecord } from '@/types'
import { formatDate, formatPrice } from '@/lib/utils'

export default function GroomingTab({ records, petName }: { records: GroomingRecord[]; petName: string }) {
  if (records.length === 0) {
    return (
      <div className="rounded-xl border border-border-t bg-white px-4 py-10 text-center">
        <Scissors size={34} className="mx-auto text-slate-t" />
        <p className="mt-3 font-bold text-ink">尚無美容紀錄</p>
        <p className="mx-auto mt-1 max-w-sm text-sm leading-6 text-slate-t">
          {petName} 完成美容服務後，合約、收據、照片與服務內容會出現在這裡。
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {records.map(record => (
        <article key={record.id} className="rounded-xl border border-border-t bg-white p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <span className="text-xs text-slate-t">{formatDate(record.date)}</span>
              <p className="mt-0.5 font-bold text-ink">{record.shopName || '美容店家'}</p>
              <p className="text-xs text-slate-t">{record.groomerName || '美容師未記錄'}</p>
            </div>
            <span className="shrink-0 font-black text-primary">{formatPrice(record.price)}</span>
          </div>

          <div className="mt-3 flex flex-wrap gap-1.5">
            {record.services.map(service => (
              <span key={service} className="rounded-full bg-primary-bg px-2.5 py-1 text-xs font-semibold text-primary">
                {service}
              </span>
            ))}
          </div>

          {record.notes && (
            <p className="mt-3 rounded-xl bg-surface px-3 py-2 text-xs leading-5 text-slate-t">
              {record.notes}
            </p>
          )}

          <div className="mt-3 flex flex-wrap gap-2">
            {record.contractUrl && (
              <button
                onClick={() => toast.info('合約檢視即將開放')}
                className="flex items-center gap-1.5 rounded-lg border border-border-t px-3 py-1.5 text-xs font-medium text-ink transition-colors hover:border-primary hover:text-primary"
              >
                <FileText size={14} />
                合約
              </button>
            )}
            {record.receiptUrl && (
              <button
                onClick={() => toast.info('收據檢視即將開放')}
                className="flex items-center gap-1.5 rounded-lg border border-border-t px-3 py-1.5 text-xs font-medium text-ink transition-colors hover:border-primary hover:text-primary"
              >
                <Receipt size={14} />
                收據
              </button>
            )}
            {record.photos.length > 0 && (
              <button
                onClick={() => toast.info('美容照片檢視即將開放')}
                className="flex items-center gap-1.5 rounded-lg border border-border-t px-3 py-1.5 text-xs font-medium text-ink transition-colors hover:border-primary hover:text-primary"
              >
                <Camera size={14} />
                照片 {record.photos.length}
              </button>
            )}
          </div>
        </article>
      ))}
    </div>
  )
}
