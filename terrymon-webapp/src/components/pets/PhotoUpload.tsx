'use client'
import { useRef, useState } from 'react'
import { Camera, X } from 'lucide-react'
import { toast } from 'sonner'
import { api } from '@/services/api'

interface Props {
  value: string
  onChange: (url: string) => void
}

export default function PhotoUpload({ value, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const url = await api.uploadPetPhoto(file)
      onChange(url)
    } catch {
      toast.error('上傳失敗，請稍後再試')
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <div className="flex items-center gap-3">
      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-border-t bg-surface">
        {value ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={value} alt="寵物照片" className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => onChange('')}
              className="absolute right-1 top-1 rounded-full bg-black/50 p-0.5 text-white"
            >
              <X size={12} />
            </button>
          </>
        ) : (
          <div className="flex h-full w-full items-center justify-center text-slate-t">
            <Camera size={24} />
          </div>
        )}
      </div>
      <div className="flex flex-col gap-1.5">
        <button
          type="button"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
          className="rounded-lg border border-border-t px-3 py-1.5 text-xs font-medium text-ink transition-colors hover:border-primary hover:text-primary disabled:opacity-50"
        >
          {uploading ? '上傳中...' : '選擇照片'}
        </button>
        <p className="text-[11px] text-slate-t">JPG / PNG，建議正方形</p>
      </div>
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
    </div>
  )
}
