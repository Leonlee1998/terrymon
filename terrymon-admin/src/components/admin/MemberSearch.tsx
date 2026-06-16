'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export default function MemberSearch({ initial }: { initial: string }) {
  const [v, setV] = useState(initial)
  const router = useRouter()

  function submit(e: React.FormEvent) {
    e.preventDefault()
    router.push(v.trim() ? `/members?q=${encodeURIComponent(v.trim())}` : '/members')
  }

  return (
    <form onSubmit={submit} className="mb-4 flex max-w-md gap-2">
      <Input placeholder="搜尋姓名 / 電話 / Email" value={v} onChange={(e) => setV(e.target.value)} />
      <Button type="submit">搜尋</Button>
    </form>
  )
}
