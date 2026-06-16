import { ChevronRight, ShieldCheck, Star, Store } from 'lucide-react'
import Link from 'next/link'
import type { Vendor } from '@/types'

interface Props { vendor: Vendor }

export default function VendorSection({ vendor }: Props) {
  return (
    <div className="bg-white">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border-t">
        <div className="w-11 h-11 rounded-xl overflow-hidden bg-primary-bg flex items-center justify-center shrink-0">
          {vendor.logoUrl
            ? <img src={vendor.logoUrl} alt={vendor.storeName} className="w-full h-full object-cover" />
            : <Store size={22} className="text-primary" />
          }
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-semibold text-ink text-sm truncate">{vendor.storeName}</span>
            {vendor.isVerified && (
              <span className="inline-flex items-center gap-0.5 text-[10px] bg-primary text-white px-1.5 py-0.5 rounded font-medium shrink-0">
                <ShieldCheck size={10} />認證
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 mt-0.5 text-xs text-slate-t">
            <span className="flex items-center gap-0.5">
              <Star size={11} className="fill-amber-400 text-amber-400" />
              {vendor.rating}
            </span>
            <span>{vendor.reviewCount.toLocaleString()} 評論</span>
            <span>{vendor.productCount} 商品</span>
          </div>
        </div>

        <Link
          href={`/shop/vendor/${vendor.id}`}
          className="flex items-center gap-0.5 text-xs text-primary font-medium shrink-0"
        >
          訪問商店<ChevronRight size={13} />
        </Link>
      </div>

      {vendor.description && (
        <p className="px-4 py-2.5 text-xs text-slate-t leading-relaxed">{vendor.description}</p>
      )}
    </div>
  )
}
