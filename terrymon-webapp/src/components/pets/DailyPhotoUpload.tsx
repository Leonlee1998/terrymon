'use client'

import { useRef, useState } from 'react'
import { Camera, X, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { api } from '@/services/api'

interface Props {
  value: string[]
  onChange: (urls: string[]) => void
  max?: number
}

export default function DailyPhotoUpload({ value, onChange, max = 5 }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  async function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return
    const remaining = max - value.length
    if (remaining <= 0) { toast.error(`最多 ${max} 張`); return }
    setUploading(true)
    try {
      const urls = await Promise.all(files.slice(0, remaining).map(f => api.uploadPetPhoto(f)))
      onChange([...value, ...urls])
    } catch {
      toast.error('上傳失敗，請稍後再試')
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <div>
      <p className="mb-2 text-xs text-slate-t">照片（選填，最多 {max} 張）</p>
      <div className="flex flex-wrap gap-2">
        {value.map((url, idx) => (
          <div key={url} className="relative h-16 w-16 overflow-hidden rounded-xl border border-border-t">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt="紀錄照片" className="h-full w-full object-cover" />
            <button type="button" onClick={() => onChange(value.filter((_, i) => i !== idx))}
              className="absolute right-0.5 top-0.5 rounded-full bg-black/50 p-0.5 text-white">
              <X size={10} />
            </button>
          </div>
        ))}
        {value.length < max && (
          <button type="button" onClick={() => inputRef.current?.click()} disabled={uploading}
            className="flex h-16 w-16 flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-border-t text-slate-t hover:border-primary hover:text-primary disabled:opacity-50 transition-colors">
            {uploading ? <Loader2 size={18} className="animate-spin" /> : <Camera size={18} />}
            {!uploading && <span className="text-[10px]">新增</span>}
          </button>
        )}
      </div>
      <input ref={inputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFiles} />
    </div>
  )
}
