import { ShieldCheck, Star, Store } from 'lucide-react'
import type { Vendor } from '@/types'

interface Props { vendor: Vendor; productCount: number }

export default function VendorStoreHeader({ vendor, productCount }: Props) {
  const yearJoined = vendor.joinedAt ? new Date(vendor.joinedAt).getFullYear() : null

  return (
    <div className="bg-white border-b border-border-t">
      <div className="px-4 pt-4 pb-3">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-2xl overflow-hidden bg-primary-bg flex items-center justify-center shrink-0 border border-border-t">
            {vendor.logoUrl
              ? <img src={vendor.logoUrl} alt={vendor.storeName} className="w-full h-full object-cover" />
              : <Store size={28} className="text-primary" />
            }
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h2 className="text-lg font-black text-ink">{vendor.storeName}</h2>
              {vendor.isVerified && (
                <span className="inline-flex items-center gap-0.5 text-[10px] bg-primary text-white px-1.5 py-0.5 rounded-full font-bold shrink-0">
                  <ShieldCheck size={10} />認證
                </span>
              )}
            </div>
            {yearJoined && (
              <p className="text-xs text-slate-t mt-0.5">已入駐 TerryMon · {yearJoined} 年加入</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4 mt-3 text-sm">
          <div className="flex items-center gap-1">
            <Star size={14} className="fill-amber-400 text-amber-400" />
            <span className="font-bold text-ink">{vendor.rating}</span>
          </div>
          <div className="text-slate-t text-xs">{vendor.reviewCount.toLocaleString()} 則評論</div>
          <div className="text-slate-t text-xs">{productCount} 件商品</div>
        </div>

        {(vendor.storeDescription || vendor.description) && (
          <p className="mt-3 text-xs text-slate-t leading-relaxed border-t border-border-t pt-3">
            {vendor.storeDescription ?? vendor.description}
          </p>
        )}
      </div>
    </div>
  )
}
