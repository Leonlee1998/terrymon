'use client'
import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { X, Plus } from 'lucide-react'
import { CONTRACT_TEMPLATE, MOCK_GROOMERS } from '@/lib/mock'

export default function SettingsPage() {
  const [contractText, setContractText] = useState(CONTRACT_TEMPLATE)
  const [groomers, setGroomers] = useState<string[]>([...MOCK_GROOMERS])
  const [newGroomer, setNewGroomer] = useState('')
  const [shopName, setShopName] = useState('TerryMon 美容院')
  const [shopAddress, setShopAddress] = useState('台北市大安區忠孝東路四段100號')
  const [shopPhone, setShopPhone] = useState('02-1234-5678')

  function addGroomer() {
    const name = newGroomer.trim()
    if (!name) return
    setGroomers(prev => [...prev, name])
    setNewGroomer('')
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold text-ink">設定</h1>

      <div className="bg-surface border border-border-t rounded-xl p-5">
        <h2 className="font-semibold text-ink mb-1">合約範本</h2>
        <p className="text-xs text-slate-t mb-3">
          可用變數：{'{{memberName}} {{memberPhone}} {{petName}} {{petBreed}} {{petWeight}} {{serviceList}} {{totalPrice}} {{serviceDate}} {{signDate}}'}
        </p>
        <Textarea
          value={contractText}
          onChange={e => setContractText(e.target.value)}
          className="h-64 font-mono text-sm"
        />
        <Button
          className="mt-3 bg-primary hover:bg-primary-hover text-white"
          onClick={() => toast.success('合約範本已儲存')}
        >
          儲存範本
        </Button>
      </div>

      <div className="bg-surface border border-border-t rounded-xl p-5">
        <h2 className="font-semibold text-ink mb-3">美容師管理</h2>
        <ul className="space-y-2 mb-3">
          {groomers.map(g => (
            <li key={g} className="flex items-center justify-between border border-border-t rounded-lg px-3 py-2 text-sm">
              <span className="text-ink">{g}</span>
              <button
                onClick={() => setGroomers(prev => prev.filter(x => x !== g))}
                className="text-slate-t hover:text-error transition-colors"
              >
                <X size={16} />
              </button>
            </li>
          ))}
        </ul>
        <div className="flex gap-2">
          <Input
            value={newGroomer}
            onChange={e => setNewGroomer(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addGroomer() } }}
            placeholder="新增美容師姓名"
            className="flex-1"
          />
          <Button onClick={addGroomer} variant="outline"><Plus size={16} /></Button>
        </div>
      </div>

      <div className="bg-surface border border-border-t rounded-xl p-5">
        <h2 className="font-semibold text-ink mb-3">店家資訊</h2>
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium text-ink mb-1 block">店名</label>
            <Input value={shopName} onChange={e => setShopName(e.target.value)} />
          </div>
          <div>
            <label className="text-sm font-medium text-ink mb-1 block">地址</label>
            <Input value={shopAddress} onChange={e => setShopAddress(e.target.value)} />
          </div>
          <div>
            <label className="text-sm font-medium text-ink mb-1 block">電話</label>
            <Input value={shopPhone} onChange={e => setShopPhone(e.target.value)} />
          </div>
          <Button
            className="bg-primary hover:bg-primary-hover text-white"
            onClick={() => toast.success('店家資訊已儲存')}
          >
            儲存設定
          </Button>
        </div>
      </div>
    </div>
  )
}
