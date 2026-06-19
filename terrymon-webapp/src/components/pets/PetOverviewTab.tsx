'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronDown, ChevronUp, FileText, HeartPulse, Scissors, Users } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import HealthAlertCard from './HealthAlertCard'
import PetOwnerSection from './PetOwnerSection'
import DailySummaryCard from './DailySummaryCard'
import CareInfoSheet from './CareInfoSheet'
import type { AIoTDevice, GroomingRecord, MedicalRecord, Pet, PetHealthData } from '@/types'
import { formatDate, formatPrice } from '@/lib/utils'

function shortMonsterId(id: string) {
  const clean = id.replace(/-/g, '').toUpperCase()
  return `${clean.slice(0, 2)}-${clean.slice(2, 6)}-${clean.slice(6, 10)}`
}

function fmtBirth(date: string) {
  if (!date) return '—'
  const [y, m, d] = date.split('-')
  return `${y} / ${m} / ${d}`
}

function latestDate(records: { date: string }[]) {
  return records.length ? records[0].date : null
}

function InfoCell({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] font-semibold tracking-widest text-card-teal uppercase">{label}</p>
      <p className="mt-0.5 text-sm font-bold text-gray-700 break-all">{value || '—'}</p>
    </div>
  )
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
  const [detailOpen, setDetailOpen] = useState(false)
  const [careOpen, setCareOpen]     = useState(false)

  const latestMedical  = latestDate(medicalRecords)
  const latestGrooming = groomingRecords[0]
  const latestWeight   = healthData.weight.at(-1)

  return (
    <div className="space-y-4">

      {/* ── 基本資料（可展開） ── */}
      <div className="rounded-2xl border border-border-t bg-white overflow-hidden">
        <button
          onClick={() => setDetailOpen(o => !o)}
          className="w-full flex items-center justify-between px-4 py-3.5 text-left hover:bg-surface transition-colors"
        >
          <div className="flex items-center gap-2">
            <span className="text-base">🐾</span>
            <span className="text-sm font-bold text-ink">基本資料</span>
          </div>
          {detailOpen
            ? <ChevronUp size={16} className="text-slate-t" />
            : <ChevronDown size={16} className="text-slate-t" />}
        </button>

        {detailOpen && (
          <div className="px-4 pb-4 border-t border-border-t">
            <div className="grid grid-cols-2 gap-x-4 gap-y-4 mt-4">
              <InfoCell label="Monster ID" value={shortMonsterId(pet.id)} />
              {pet.chipId && <InfoCell label="Microchip" value={pet.chipId} />}
              <InfoCell label="生日" value={fmtBirth(pet.birthDate)} />
              {pet.bloodType && <InfoCell label="血型" value={pet.bloodType} />}
              {pet.caregiver && <InfoCell label="照顧者" value={pet.caregiver} />}
              {pet.breed && <InfoCell label="品種" value={pet.breed} />}
            </div>

            {pet.notes && (
              <div className="mt-4 rounded-xl bg-amber-50 border border-amber-200 px-3 py-2.5">
                <p className="text-[11px] font-semibold text-amber-700 mb-0.5">照護備註</p>
                <p className="text-xs text-amber-800">{pet.notes}</p>
              </div>
            )}

            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setCareOpen(true)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-card-teal text-card-teal text-xs font-semibold hover:bg-card-teal-light transition-colors"
              >
                <Users size={13} />
                照護資訊
              </button>
              <div className="flex-1 flex flex-col items-center justify-center py-2 rounded-xl border border-card-teal">
                <QRCodeSVG value={`TERRYMON-PET-${pet.id}`} size={48} bgColor="transparent" fgColor="#4AAAB5" level="M" />
                <p className="text-[9px] font-bold tracking-widest text-card-teal opacity-60 mt-0.5">PET QR</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <HealthAlertCard pet={pet} healthData={healthData} devices={devices} />

      <DailySummaryCard petId={pet.id} />

      {/* ── 3 stat cards ── */}
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

      <CareInfoSheet pet={pet} open={careOpen} onOpenChange={setCareOpen} />
    </div>
  )
}
