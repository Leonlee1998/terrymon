'use client'
import { useState } from 'react'
import { FileText, ClipboardList, Receipt, BarChart2, ChevronDown, ChevronUp } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { toast } from 'sonner'
import type { DocItem, DocumentType } from '@/types'

const DOC_CONFIG: Record<DocumentType, { icon: React.ElementType; label: string; color: string }> = {
  prescription: { icon: ClipboardList, label: '藥單',  color: 'text-primary bg-primary-bg' },
  receipt:      { icon: Receipt,       label: '收據',  color: 'text-blue-600 bg-blue-50' },
  contract:     { icon: FileText,      label: '合約',  color: 'text-accent bg-accent-light' },
  report:       { icon: BarChart2,     label: '報告',  color: 'text-purple-600 bg-purple-50' },
}

export default function DocumentsList({ documents }: { documents: DocItem[] }) {
  const [expanded, setExpanded] = useState(false)
  const unreadCount = documents.filter(d => !d.isRead).length
  const displayDocs = expanded ? documents : documents.slice(0, 3)

  return (
    <div className="bg-white rounded-2xl border border-border-t">
      <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-border-t">
        <div className="flex items-center gap-2">
          <FileText size={16} className="text-primary" />
          <h3 className="font-semibold text-ink text-sm">我的文件</h3>
          {unreadCount > 0 && (
            <span className="bg-accent text-white text-[10px] font-bold rounded-full px-1.5 py-0.5">
              {unreadCount}
            </span>
          )}
        </div>
      </div>

      <div className="divide-y divide-border-t">
        {displayDocs.map(doc => {
          const config = DOC_CONFIG[doc.type]
          const Icon = config.icon
          return (
            <button
              key={doc.id}
              onClick={() => toast.info(`開啟：${doc.title}`)}
              className="flex items-center gap-3 px-4 py-3 w-full text-left hover:bg-surface transition-colors"
            >
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${config.color}`}>
                <Icon size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm truncate ${doc.isRead ? 'text-ink' : 'text-ink font-semibold'}`}>
                  {doc.title}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-slate-t">{formatDate(doc.createdAt)}</span>
                  {doc.size && <span className="text-xs text-slate-t">{doc.size}</span>}
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${config.color}`}>
                    {config.label}
                  </span>
                </div>
              </div>
              {!doc.isRead && (
                <span className="w-2 h-2 rounded-full bg-accent flex-shrink-0" />
              )}
            </button>
          )
        })}
      </div>

      {documents.length > 3 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center justify-center gap-1 w-full py-3 border-t border-border-t text-xs text-slate-t hover:text-primary transition-colors"
        >
          {expanded ? (
            <><ChevronUp size={14} /> 收起</>
          ) : (
            <><ChevronDown size={14} /> 查看全部 {documents.length} 份文件</>
          )}
        </button>
      )}
    </div>
  )
}
