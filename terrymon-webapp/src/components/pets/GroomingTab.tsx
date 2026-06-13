import type { GroomingRecord } from '@/types'
import { formatDate, formatPrice } from '@/lib/utils'
import { FileText, Receipt, Image as ImageIcon } from 'lucide-react'
import { toast } from 'sonner'
import EmptyState from '@/components/shared/EmptyState'

export default function GroomingTab({ records, petName }: { records: GroomingRecord[]; petName: string }) {
  if (records.length === 0) {
    return <EmptyState icon="✂️" title="還沒有美容紀錄" subtitle="每次美容後記錄會自動同步到這裡" />
  }

  return (
    <div className="space-y-3">
      {records.map(record => (
        <div key={record.id} className="bg-white rounded-2xl border border-border-t p-4">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs text-slate-t">{formatDate(record.date)}</span>
              <p className="font-semibold text-ink mt-0.5">{record.shopName}</p>
              <p className="text-xs text-slate-t">{record.groomerName}</p>
            </div>
            <span className="font-bold text-primary">{formatPrice(record.price)}</span>
          </div>

          {/* Service tags */}
          <div className="flex flex-wrap gap-1.5 mt-3">
            {record.services.map(s => (
              <span key={s} className="bg-primary-bg text-primary text-xs px-2 py-0.5 rounded-full font-medium">
                {s}
              </span>
            ))}
          </div>

          {/* Notes */}
          {record.notes && (
            <p className="text-xs text-slate-t mt-2 bg-surface rounded-lg px-3 py-2">
              💬 {record.notes}
            </p>
          )}

          {/* Document buttons */}
          <div className="flex gap-2 mt-3 flex-wrap">
            {record.contractUrl && (
              <button
                onClick={() => toast.info('開啟美容合約')}
                className="flex items-center gap-1.5 text-xs border border-border-t rounded-lg px-3 py-1.5 text-ink hover:border-primary hover:text-primary transition-colors"
              >
                <FileText size={14} />
                美容合約
              </button>
            )}
            {record.receiptUrl && (
              <button
                onClick={() => toast.info('開啟收據')}
                className="flex items-center gap-1.5 text-xs border border-border-t rounded-lg px-3 py-1.5 text-ink hover:border-primary hover:text-primary transition-colors"
              >
                <Receipt size={14} />
                收據
              </button>
            )}
            {record.photos.length > 0 && (
              <button
                onClick={() => toast.info('查看美容前後照片')}
                className="flex items-center gap-1.5 text-xs border border-border-t rounded-lg px-3 py-1.5 text-ink hover:border-primary hover:text-primary transition-colors"
              >
                <ImageIcon size={14} />
                照片 ({record.photos.length})
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
