'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Camera, CheckCircle, PawPrint, Upload } from 'lucide-react'
import { toast } from 'sonner'
import { api } from '@/services/api'
import type { CheckpointDetail } from '@/types'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

interface Props {
  detail: CheckpointDetail
}

export default function CheckpointReportForm({ detail }: Props) {
  const router = useRouter()
  const { checkpoint, questions, orgName, pet } = detail
  const [answers, setAnswers] = useState<string[]>(() => questions.map((_, i) => checkpoint.responses[i]?.a ?? ''))
  const [photos, setPhotos] = useState<string[]>(checkpoint.photoUrls)
  const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const alreadySubmitted = checkpoint.status === 'submitted'

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const url = await api.uploadPetPhoto(file)
      setPhotos(prev => [...prev, url])
    } catch {
      toast.error('上傳失敗，請再試一次')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  async function handleSubmit() {
    if (answers.some(a => !a.trim())) { toast.error('請填寫所有問題'); return }
    setSubmitting(true)
    try {
      await api.submitCheckpoint(checkpoint.id, {
        photoUrls: photos,
        responses: questions.map((q, i) => ({ q, a: answers[i].trim() })),
      })
      toast.success('回報已送出！謝謝您的更新')
      router.refresh()
    } catch {
      toast.error('送出失敗，請再試一次')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-surface/40 pb-10">
      <div className="sticky top-0 z-10 border-b border-border-t bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-14 w-full max-w-2xl items-center px-4">
          <h1 className="font-bold text-ink">健康回報 — 第 {checkpoint.dueMonth} 個月</h1>
        </div>
      </div>

      <div className="mx-auto w-full max-w-2xl space-y-4 p-4">
        {/* Pet card */}
        <div className="flex items-center gap-4 rounded-2xl border border-border-t bg-white p-4">
          {pet.photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={pet.photoUrl} alt={pet.name} className="h-16 w-16 rounded-full object-cover" />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-bg">
              <PawPrint size={28} className="text-primary" />
            </div>
          )}
          <div>
            <p className="text-lg font-black text-ink">{pet.name}</p>
            <p className="text-sm text-slate-t">{pet.breed || pet.species}</p>
            <p className="text-xs text-slate-t">由 {orgName} 請求回報</p>
          </div>
        </div>

        {alreadySubmitted && (
          <div className="flex items-center gap-2 rounded-2xl border border-green-200 bg-green-50 px-4 py-3">
            <CheckCircle size={16} className="text-success" />
            <p className="text-sm font-medium text-success">此回報已完成送出</p>
          </div>
        )}

        {/* Photo upload */}
        <div className="rounded-2xl border border-border-t bg-white p-4">
          <p className="mb-3 font-semibold text-ink">上傳近況照片</p>
          <div className="flex flex-wrap gap-2">
            {photos.map((url, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={i} src={url} alt={`照片${i + 1}`}
                className="h-20 w-20 rounded-xl object-cover ring-1 ring-border-t" />
            ))}
            {!alreadySubmitted && photos.length < 5 && (
              <label className={`flex h-20 w-20 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border-t text-slate-t transition-colors hover:border-primary hover:text-primary ${uploading ? 'opacity-50' : ''}`}>
                <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} disabled={uploading} />
                {uploading ? <Upload size={20} className="animate-bounce" /> : <Camera size={20} />}
                <span className="mt-1 text-[10px]">{uploading ? '上傳中' : '新增'}</span>
              </label>
            )}
          </div>
        </div>

        {/* Q&A */}
        <div className="space-y-3">
          {questions.map((q, i) => (
            <div key={i} className="rounded-2xl border border-border-t bg-white p-4">
              <p className="mb-2 text-sm font-semibold text-ink">{i + 1}. {q}</p>
              <Textarea
                value={answers[i]}
                onChange={e => setAnswers(prev => prev.map((a, j) => j === i ? e.target.value : a))}
                rows={3}
                placeholder="請填寫..."
                disabled={alreadySubmitted}
                className="resize-none"
              />
            </div>
          ))}
        </div>

        {!alreadySubmitted && (
          <Button
            onClick={handleSubmit}
            disabled={submitting || answers.some(a => !a.trim())}
            className="w-full bg-primary py-3 text-base font-bold text-white hover:bg-primary-hover"
          >
            {submitting ? '送出中...' : '送出回報'}
          </Button>
        )}
      </div>
    </div>
  )
}
