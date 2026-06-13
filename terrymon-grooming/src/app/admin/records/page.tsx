'use client'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'
import { MOCK_GROOMING_RECORDS, MOCK_PETS, MOCK_MEMBER } from '@/lib/mock'

export default function RecordsPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-ink">美容紀錄</h1>
        <Button variant="outline" onClick={() => toast('匯出功能開發中')}>
          <Download size={16} className="mr-1" />匯出
        </Button>
      </div>

      <div className="bg-surface border border-border-t rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-border-t text-slate-t">
            <tr>
              <th className="text-left px-4 py-3 font-medium">日期</th>
              <th className="text-left px-4 py-3 font-medium">飼主</th>
              <th className="text-left px-4 py-3 font-medium">毛孩</th>
              <th className="text-left px-4 py-3 font-medium">服務</th>
              <th className="text-left px-4 py-3 font-medium">金額</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-t">
            {MOCK_GROOMING_RECORDS.map(r => {
              const pet = MOCK_PETS.find(p => p.id === r.petId)
              return (
                <tr key={r.id}>
                  <td className="px-4 py-3 text-slate-t">{r.date}</td>
                  <td className="px-4 py-3 text-ink">{MOCK_MEMBER.name}</td>
                  <td className="px-4 py-3 text-ink">{pet?.name ?? '—'}</td>
                  <td className="px-4 py-3 text-slate-t">{r.services.join('、')}</td>
                  <td className="px-4 py-3 font-medium text-ink">NT$ {r.price.toLocaleString()}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
