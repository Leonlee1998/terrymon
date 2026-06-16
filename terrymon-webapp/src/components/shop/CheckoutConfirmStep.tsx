'use client'
import { Store } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatPrice } from '@/lib/utils'
import type { CartItem } from '@/types'
import type { AddressValues } from './CheckoutAddressStep'

const SHIPPING_THRESHOLD = 1000
const SHIPPING_FEE = 60
const PAYMENT_OPTIONS = [
  { id: 'credit', label: '信用卡',   desc: 'Visa · Mastercard · JCB' },
  { id: 'atm',    label: 'ATM 轉帳', desc: '各大銀行虛擬帳號' },
  { id: 'cvs',    label: '超商代碼', desc: '7-11、全家、萊爾富付款碼' },
]

function groupByVendor(items: CartItem[]) {
  const map = new Map<string, { vendorId: string; vendorName: string; items: CartItem[] }>()
  for (const item of items) {
    const key = item.product.vendorId
    if (!map.has(key)) map.set(key, { vendorId: key, vendorName: item.product.vendorName, items: [] })
    map.get(key)!.items.push(item)
  }
  return [...map.values()]
}

interface Props {
  items: CartItem[]
  formData: AddressValues
  subtotal: number
  paymentMethod: string
  onPaymentChange: (m: string) => void
  loading: boolean
  onConfirm: () => void
}

export default function CheckoutConfirmStep({ items, formData, subtotal, paymentMethod, onPaymentChange, loading, onConfirm }: Props) {
  const groups = groupByVendor(items)
  const shippingFee = subtotal >= SHIPPING_THRESHOLD ? 0 : groups.length * SHIPPING_FEE

  return (
    <div className="space-y-3">
      {groups.map(group => {
        const groupSubtotal = group.items.reduce((s, i) => s + i.product.price * i.qty, 0)
        const groupShipping = subtotal >= SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE
        return (
          <div key={group.vendorId} className="bg-white rounded-xl border border-border-t overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-2.5 bg-surface border-b border-border-t">
              <Store size={14} className="text-primary" />
              <span className="text-sm font-semibold text-ink">{group.vendorName}</span>
            </div>
            <div className="divide-y divide-border-t">
              {group.items.map(({ product, qty }) => (
                <div key={product.id} className="flex gap-3 items-center px-4 py-3">
                  <img src={product.imageUrl} alt={product.name} className="w-12 h-12 rounded-lg object-cover" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-ink line-clamp-2">{product.name}</p>
                    <p className="text-xs text-slate-t mt-0.5">× {qty}</p>
                  </div>
                  <span className="text-sm font-medium shrink-0">{formatPrice(product.price * qty)}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-between px-4 py-2.5 border-t border-border-t text-xs text-slate-t">
              <span>運費 {groupShipping === 0 ? '（免運）' : formatPrice(groupShipping)}</span>
              <span>小計 <span className="font-semibold text-ink">{formatPrice(groupSubtotal + groupShipping)}</span></span>
            </div>
          </div>
        )
      })}

      <div className="bg-white rounded-xl border border-border-t p-4 text-sm space-y-1">
        <p className="font-semibold text-ink mb-2">收件資訊</p>
        <p className="text-slate-t">{formData.recipientName}・{formData.phone}</p>
        <p className="text-slate-t">{formData.address}</p>
        {formData.notes && <p className="text-slate-t text-xs mt-1">備注：{formData.notes}</p>}
      </div>

      <div className="bg-white rounded-xl border border-border-t p-4 space-y-1.5 text-sm">
        <div className="flex justify-between"><span className="text-slate-t">商品小計</span><span>{formatPrice(subtotal)}</span></div>
        <div className="flex justify-between"><span className="text-slate-t">運費</span><span>{shippingFee === 0 ? '免運' : formatPrice(shippingFee)}</span></div>
        <div className="flex justify-between font-bold border-t border-border-t pt-2 text-base">
          <span>總計</span><span className="text-primary">{formatPrice(subtotal + shippingFee)}</span>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-border-t p-4 text-sm">
        <p className="font-semibold text-ink mb-3">付款方式</p>
        <div className="space-y-2">
          {PAYMENT_OPTIONS.map(opt => (
            <label key={opt.id} className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-colors ${paymentMethod === opt.id ? 'border-primary' : 'border-border-t'}`}>
              <input type="radio" name="payment" value={opt.id} checked={paymentMethod === opt.id} onChange={() => onPaymentChange(opt.id)} className="accent-primary" />
              <div>
                <p className="font-medium text-ink">{opt.label}</p>
                <p className="text-xs text-slate-t">{opt.desc}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      <Button onClick={onConfirm} disabled={loading} className="w-full h-12 bg-primary hover:bg-primary-hover text-white">
        {loading ? '處理中…' : `前往付款（共 ${groups.length} 筆訂單）`}
      </Button>
    </div>
  )
}
