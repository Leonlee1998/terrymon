import Link from 'next/link'
import { Package, ChevronRight } from 'lucide-react'
import { formatDate, formatPrice } from '@/lib/utils'
import StatusBadge from '@/components/shared/StatusBadge'
import type { Order } from '@/types'

export default function OrderSummary({ orders }: { orders: Order[] }) {
  const recentOrders = orders.slice(0, 3)

  return (
    <div className="bg-white rounded-2xl border border-border-t">
      <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-border-t">
        <div className="flex items-center gap-2">
          <Package size={16} className="text-primary" />
          <h3 className="font-semibold text-ink text-sm">最近訂單</h3>
        </div>
        <Link href="/shop/orders" className="flex items-center gap-0.5 text-xs text-primary">
          查看全部 <ChevronRight size={14} />
        </Link>
      </div>

      {recentOrders.length === 0 ? (
        <div className="py-6 text-center text-slate-t text-sm">還沒有訂單</div>
      ) : (
        <div className="divide-y divide-border-t">
          {recentOrders.map(order => (
            <Link
              key={order.id}
              href={`/shop/orders/${order.id}`}
              className="flex items-center gap-3 px-4 py-3 hover:bg-surface transition-colors"
            >
              {/* Images */}
              <div className="flex -space-x-2">
                {order.items.slice(0, 3).map(item => (
                  <img
                    key={item.productId}
                    src={item.imageUrl}
                    alt={item.productName}
                    className="w-9 h-9 rounded-xl border-2 border-white object-cover"
                  />
                ))}
              </div>
              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-xs text-slate-t">{formatDate(order.createdAt)}</p>
                <p className="text-sm font-medium text-ink truncate">
                  {order.items[0].productName}
                  {order.items.length > 1 && ` 等 ${order.items.length} 件`}
                </p>
              </div>
              {/* Price + Status */}
              <div className="text-right flex-shrink-0">
                <p className="text-sm font-bold text-ink">{formatPrice(order.totalPrice)}</p>
                <StatusBadge status={order.status} />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
