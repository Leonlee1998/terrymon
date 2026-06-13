'use client'
import { useState } from 'react'
import { toast } from 'sonner'
import { Wallet, Gift } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import type { Member } from '@/types'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuthStore } from '@/stores/authStore'

const PRESET_AMOUNTS = [500, 1000, 2000, 3000]

const REDEMPTION_OPTIONS = [
  { id: 'r1', name: '洗澡折抵券', desc: '可抵扣美容費用 $100', points: 500, value: 100 },
  { id: 'r2', name: '全身 SPA 體驗券', desc: '含精油護膚一次', points: 1000, value: 200 },
  { id: 'r3', name: '精油護毛護理', desc: '頂級護毛體驗', points: 1500, value: 350 },
]

export default function BalanceCard({ member }: { member: Member }) {
  const { updateMember } = useAuthStore()
  const [topupOpen, setTopupOpen] = useState(false)
  const [redeemOpen, setRedeemOpen] = useState(false)
  const [selectedAmt, setSelectedAmt] = useState(1000)
  const [customAmt, setCustomAmt] = useState('')
  const [loading, setLoading] = useState(false)

  const finalAmount = customAmt ? (parseInt(customAmt) || 0) : selectedAmt

  async function handleTopup() {
    if (finalAmount < 100) { toast.error('最低儲值金額 NT$100'); return }
    setLoading(true)
    await new Promise(r => setTimeout(r, 600))
    updateMember({ balance: member.balance + finalAmount })
    setLoading(false)
    setTopupOpen(false)
    setCustomAmt('')
    toast.success(`成功儲值 ${formatPrice(finalAmount)}！`)
  }

  async function handleRedeem(opt: typeof REDEMPTION_OPTIONS[0]) {
    if (member.points < opt.points) { toast.error('點數不足'); return }
    setLoading(true)
    await new Promise(r => setTimeout(r, 600))
    updateMember({ points: member.points - opt.points })
    setLoading(false)
    setRedeemOpen(false)
    toast.success(`已兌換「${opt.name}」！`)
  }

  return (
    <>
      <div className="bg-white rounded-2xl border border-border-t overflow-hidden">
        <div className="grid grid-cols-2 divide-x divide-border-t">
          <div className="p-4">
            <div className="flex items-center gap-1.5 mb-2">
              <Wallet size={14} className="text-accent" />
              <p className="text-xs text-slate-t font-medium">美容儲值</p>
            </div>
            <p className="text-2xl font-black text-accent">{formatPrice(member.balance)}</p>
            <button
              onClick={() => { setCustomAmt(''); setSelectedAmt(1000); setTopupOpen(true) }}
              className="mt-2 text-xs text-accent border border-accent/30 rounded-lg px-3 py-1 hover:bg-accent-light transition-colors"
            >
              立即儲值
            </button>
          </div>

          <div className="p-4">
            <div className="flex items-center gap-1.5 mb-2">
              <Gift size={14} className="text-primary" />
              <p className="text-xs text-slate-t font-medium">會員點數</p>
            </div>
            <p className="text-2xl font-black text-primary">{member.points.toLocaleString()}</p>
            <button
              onClick={() => setRedeemOpen(true)}
              className="mt-2 text-xs text-primary border border-primary/30 rounded-lg px-3 py-1 hover:bg-primary-bg transition-colors"
            >
              查看兌換
            </button>
          </div>
        </div>

        <div className="px-4 pb-4 pt-2 border-t border-border-t">
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-xs text-slate-t">距離升級金卡</p>
            <p className="text-xs font-medium text-primary">差 720 點</p>
          </div>
          <div className="h-1.5 bg-border-t rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-primary to-primary-light rounded-full" style={{ width: '28%' }} />
          </div>
        </div>
      </div>

      {/* Top-up Dialog */}
      <Dialog open={topupOpen} onOpenChange={setTopupOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>美容儲值</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <p className="text-sm text-slate-t">選擇儲值金額</p>
            <div className="grid grid-cols-2 gap-2">
              {PRESET_AMOUNTS.map(amt => (
                <button
                  key={amt}
                  onClick={() => { setSelectedAmt(amt); setCustomAmt('') }}
                  className={`py-3 rounded-xl border-2 font-semibold text-sm transition-colors ${
                    selectedAmt === amt && !customAmt
                      ? 'border-accent bg-accent-light text-accent'
                      : 'border-border-t text-ink hover:border-accent'
                  }`}
                >
                  {formatPrice(amt)}
                </button>
              ))}
            </div>
            <div>
              <label className="text-sm font-medium text-ink block mb-1">自訂金額</label>
              <Input
                type="number"
                placeholder="輸入其他金額"
                value={customAmt}
                onChange={e => setCustomAmt(e.target.value)}
              />
            </div>
            <div className="bg-surface rounded-xl px-4 py-3 flex justify-between text-sm font-semibold">
              <span className="text-slate-t">本次儲值</span>
              <span className="text-accent">{formatPrice(finalAmount)}</span>
            </div>
            <Button
              onClick={handleTopup}
              disabled={loading || finalAmount < 100}
              className="w-full bg-accent hover:bg-accent/90 text-white"
            >
              {loading ? '處理中…' : `確認儲值 ${formatPrice(finalAmount)}`}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Redemption Dialog */}
      <Dialog open={redeemOpen} onOpenChange={setRedeemOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>點數兌換</DialogTitle>
          </DialogHeader>
          <div className="mt-2 space-y-3">
            <div className="flex items-center justify-between text-sm bg-primary-bg px-3 py-2 rounded-xl">
              <span className="text-slate-t">目前點數</span>
              <span className="font-bold text-primary">{member.points.toLocaleString()} 點</span>
            </div>
            {REDEMPTION_OPTIONS.map(opt => (
              <div key={opt.id} className="flex items-center justify-between border border-border-t rounded-xl p-3 gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-ink">{opt.name}</p>
                  <p className="text-xs text-slate-t">{opt.desc}</p>
                  <p className="text-xs text-primary font-medium mt-0.5">{opt.points.toLocaleString()} 點兌換</p>
                </div>
                <Button
                  size="sm"
                  onClick={() => handleRedeem(opt)}
                  disabled={member.points < opt.points || loading}
                  className="flex-shrink-0 bg-primary hover:bg-primary-hover text-white text-xs"
                >
                  兌換
                </Button>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
