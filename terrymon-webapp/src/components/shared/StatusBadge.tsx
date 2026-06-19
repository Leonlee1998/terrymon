import { cn } from '@/lib/utils'

const CONFIG: Record<string, { label: string; className: string }> = {
  pending:    { label: '待確認', className: 'bg-yellow-100 text-yellow-700' },
  confirmed:  { label: '已確認', className: 'bg-primary-bg text-primary' },
  rejected:   { label: '已拒絕', className: 'bg-red-50 text-red-600' },
  checked_in: { label: '已報到', className: 'bg-blue-100 text-blue-700' },
  in_service: { label: '服務中', className: 'bg-purple-100 text-purple-700' },
  completed:  { label: '已完成', className: 'bg-gray-100 text-gray-600' },
  no_show:    { label: '未到場', className: 'bg-orange-100 text-orange-700' },
  cancelled:  { label: '已取消', className: 'bg-red-50 text-red-600' },
  paid:      { label: '已付款', className: 'bg-blue-100 text-blue-700' },
  shipped:   { label: '已出貨', className: 'bg-purple-100 text-purple-700' },
  delivered: { label: '已送達', className: 'bg-primary-bg text-primary' },
  online:    { label: '在線',   className: 'bg-primary-bg text-primary' },
  offline:   { label: '離線',   className: 'bg-gray-100 text-gray-600' },
  error:     { label: '異常',   className: 'bg-red-50 text-red-600' },
}

export default function StatusBadge({ status }: { status: string }) {
  const config = CONFIG[status] ?? { label: status, className: 'bg-gray-100 text-gray-600' }
  return (
    <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full', config.className)}>
      {config.label}
    </span>
  )
}
