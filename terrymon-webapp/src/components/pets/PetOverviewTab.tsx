'use client'

import { useRouter } from 'next/navigation'
import { FileText, HeartPulse, Scissors } from 'lucide-react'
import HealthAlertCard from './HealthAlertCard'
import PetOwnerSection from './PetOwnerSection'
import DailySummaryCard from './DailySummaryCard'
import type { AIoTDevice, GroomingRecord, MedicalRecord, Pet, PetHealthData } from '@/types'
import { formatDate, formatPrice } from '@/lib/utils'

function latestDate(records: { date: string }[]) {
  return records.length ? records[0].date : null
}

export default function PetOverviewTab({
  pet,
  healthData,
  devices,
  medicalRecords,
  groomingRecords,
}: {
  pet: Pet
  healthData: PetHealthData
  devices: AIoTDevice[]
  medicalRecords: MedicalRecord[]
  groomingRecords: GroomingRecord[]
}) {
  const router = useRouter()
  const latestMedical = latestDate(medicalRecords)
  const latestGrooming = groomingRecords[0]
  const latestWeight = healthData.weight.at(-1)

  return (
    <div className="space-y-4">
      <HealthAlertCard pet={pet} healthData={healthData} devices={devices} />

      <DailySummaryCard petId={pet.id} />

      <section className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-border-t bg-white p-4">
          <div className="mb-2 flex items-center gap-2 text-primary">
            <HeartPulse size={17} />
            <p className="text-xs font-semibold">最新體重</p>
          </div>
          <p className="text-xl font-black text-ink">
            {latestWeight ? `${latestWeight.value} ${latestWeight.unit || 'kg'}` : `${pet.weight || '-'} kg`}
          </p>
          <p className="mt-1 text-xs text-slate-t">{latestWeight ? formatDate(latestWeight.timestamp) : '來自基本資料'}</p>
        </div>

        <div className="rounded-xl border border-border-t bg-white p-4">
          <div className="mb-2 flex items-center gap-2 text-primary">
            <FileText size={17} />
            <p className="text-xs font-semibold">最近醫療</p>
          </div>
          <p className="text-xl font-black text-ink">{medicalRecords.length} 筆</p>
          <p className="mt-1 text-xs text-slate-t">{latestMedical ? formatDate(latestMedical) : '尚無紀錄'}</p>
        </div>

        <div className="rounded-xl border border-border-t bg-white p-4">
          <div className="mb-2 flex items-center gap-2 text-primary">
            <Scissors size={17} />
            <p className="text-xs font-semibold">最近美容</p>
          </div>
          <p className="text-xl font-black text-ink">{groomingRecords.length} 筆</p>
          <p className="mt-1 text-xs text-slate-t">{latestGrooming ? formatDate(latestGrooming.date) : '尚無紀錄'}</p>
        </div>
      </section>

      {latestGrooming && (
        <section className="rounded-xl border border-border-t bg-white p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-bold text-ink">最近一次美容</h2>
            <span className="text-sm font-bold text-primary">{formatPrice(latestGrooming.price)}</span>
          </div>
          <p className="font-semibold text-ink">{latestGrooming.shopName}</p>
          <p className="mt-1 text-xs text-slate-t">{formatDate(latestGrooming.date)} · {latestGrooming.groomerName || '美容師未記錄'}</p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {latestGrooming.services.map(service => (
              <span key={service} className="rounded-full bg-primary-bg px-2.5 py-1 text-xs font-semibold text-primary">
                {service}
              </span>
            ))}
          </div>
        </section>
      )}

      <div className="rounded-xl border border-border-t bg-white p-4">
        <PetOwnerSection pet={pet} onTransferSuccess={() => router.refresh()} />
      </div>
    </div>
  )
}
