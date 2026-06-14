'use client'
import { useState, useRef } from 'react'
import Image from 'next/image'
import { Camera } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/stores/authStore'
import { toast } from 'sonner'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentAvatarUrl?: string
}

export default function AvatarPickerDialog({ open, onOpenChange, currentAvatarUrl }: Props) {
  const { updateMember } = useAuthStore()
  const [selected, setSelected] = useState(currentAvatarUrl ?? '')
  const fileRef = useRef<HTMLInputElement>(null)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { toast.error('圖片不可超過 5MB'); return }
    const reader = new FileReader()
    reader.onload = ev => {
      if (ev.target?.result) setSelected(ev.target.result as string)
    }
    reader.readAsDataURL(file)
  }

  function handleSave() {
    updateMember({ avatarUrl: selected || undefined })
    onOpenChange(false)
    toast.success('頭像已更新')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>更換頭像</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          {/* Preview */}
          <div className="flex justify-center">
            <div className="size-24 rounded-full overflow-hidden ring-4 ring-primary/20 bg-primary/10">
              {selected ? (
                <Image src={selected} alt="頭像預覽" width={96} height={96} className="size-full object-cover" unoptimized={selected.startsWith('data:')} />
              ) : (
                <div className="size-full flex items-center justify-center text-primary/30">
                  <Camera size={32} />
                </div>
              )}
            </div>
          </div>

          {/* Upload */}
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-border-t rounded-xl py-4 text-sm text-slate-t hover:border-primary/40 hover:text-primary transition-colors"
          >
            <Camera size={16} />
            選擇圖片（最大 5MB）
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />

          <Button
            onClick={handleSave}
            disabled={!selected}
            className="w-full bg-primary hover:bg-primary-hover text-white"
          >
            使用這張頭像
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
