'use client'
import { useState } from 'react'
import type { Product } from '@/types'

interface Props { product: Product }

type Tab = 'desc' | 'specs'

export default function ProductInfoTabs({ product }: Props) {
  const [tab, setTab] = useState<Tab>('desc')
  const hasSpecs = Object.keys(product.specs).length > 0

  return (
    <div className="bg-white">
      <div className="flex border-b border-border-t">
        {(['desc', 'specs'] as Tab[]).filter(t => t === 'desc' || hasSpecs).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-3 text-sm font-medium transition-colors border-b-2 ${
              tab === t ? 'border-primary text-primary' : 'border-transparent text-slate-t'
            }`}
          >
            {t === 'desc' ? '商品說明' : '商品規格'}
          </button>
        ))}
      </div>

      <div className="p-4">
        {tab === 'desc' && (
          <p className="text-sm text-slate-t leading-relaxed whitespace-pre-line">
            {product.description || '暫無商品說明'}
          </p>
        )}

        {tab === 'specs' && hasSpecs && (
          <table className="w-full text-sm">
            <tbody>
              {Object.entries(product.specs).map(([key, val]) => (
                <tr key={key} className="border-b border-border-t last:border-0">
                  <td className="py-2.5 pr-4 text-slate-t w-1/3 align-top">{key}</td>
                  <td className="py-2.5 text-ink font-medium">{val}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
