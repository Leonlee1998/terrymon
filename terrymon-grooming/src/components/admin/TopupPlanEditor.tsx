'use client'
import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { formatPrice } from '@/lib/utils'

interface Plan { amount: number; bonus: number }

const DEFAULT_PLANS: Plan[] = [
  { amount: 1000, bonus: 0 },
  { amount: 3000, bonus: 300 },
  { amount: 5000, bonus: 600 },
  { amount: 8000, bonus: 1200 },
]

export default function TopupPlanEditor() {
  const [plans, setPlans] = useState<Plan[]>(DEFAULT_PLANS)

  function addPlan() {
    setPlans(p => [...p, { amount: 0, bonus: 0 }])
  }

  function removePlan(i: number) {
    setPlans(p => p.filter((_, idx) => idx !== i))
  }

  function updatePlan(i: number, field: 'amount' | 'bonus', value: number) {
    setPlans(p => p.map((plan, idx) =>
      idx === i ? { ...plan, [field]: value } : plan
    ))
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-3 text-xs font-semibold text-slate-t uppercase px-1">
        <span>儲值金額</span>
        <span>贈送金額</span>
        <span>實際獲得</span>
      </div>

      {plans.map((plan, i) => (
        <div key={i} className="grid grid-cols-3 gap-3 items-center">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-t text-sm">NT$</span>
            <Input
              type="number"
              value={plan.amount || ''}
              onChange={e => updatePlan(i, 'amount', parseInt(e.target.value) || 0)}
              className="pl-10"
            />
          </div>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-accent text-sm">+NT$</span>
            <Input
              type="number"
              value={plan.bonus || ''}
              onChange={e => updatePlan(i, 'bonus', parseInt(e.target.value) || 0)}
              className="pl-14"
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="font-bold text-primary">
              {formatPrice(plan.amount + plan.bonus)}
            </span>
            <button onClick={() => removePlan(i)} className="text-red-400 hover:text-red-600">
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      ))}

      <button
        onClick={addPlan}
        className="flex items-center gap-1.5 text-sm text-primary border border-dashed border-primary/40 rounded-xl px-4 py-2 w-full justify-center hover:bg-primary-bg transition-colors"
      >
        <Plus size={16} /> 新增方案
      </button>

      <Button
        onClick={() => toast.success('儲值方案已儲存')}
        className="w-full bg-primary hover:bg-primary-hover text-white mt-2"
      >
        儲存所有方案
      </Button>
    </div>
  )
}
