'use client'
import { useBookingStore } from '@/stores/bookingStore'
import { Textarea } from '@/components/ui/textarea'
import { ImageIcon } from 'lucide-react'
import PhotoUpload from '@/components/pets/PhotoUpload'

export default function StepDetails() {
  const { notes, photoUrl, setNotes, setPhotoUrl } = useBookingStore()

  return (
    <div className="space-y-6">
      <div>
        <label className="text-sm font-semibold text-ink block mb-2">備注（選填）</label>
        <Textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="請描述寵物狀況、特殊需求或注意事項，讓美容師提前了解（例：怕生、毛髮易打結、需輕柔處理）"
          rows={4}
          className="resize-none"
        />
      </div>

      <div>
        <label className="text-sm font-semibold text-ink flex items-center gap-1.5 mb-1">
          <ImageIcon size={15} />寵物現況照片（選填）
        </label>
        <p className="text-xs text-slate-t mb-3">上傳目前毛髮狀態，讓美容師提前評估</p>
        <PhotoUpload
          value={photoUrl ?? ''}
          onChange={url => setPhotoUrl(url || null)}
        />
      </div>
    </div>
  )
}
