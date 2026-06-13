'use client'
import { useState } from 'react'
import { ChevronDown, AlertCircle } from 'lucide-react'
import { MOCK_MEDICAL } from '@/lib/mock'
import type { QueueItem } from '@/types'

function Collapsible({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(true)
  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold bg-muted/30 hover:bg-muted/50 transition-colors"
      >
        {title}
        <ChevronDown size={16} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <div className="px-4 py-3">{children}</div>}
    </div>
  )
}

export default function PatientPanel({ patient }: { patient: QueueItem }) {
  const records = MOCK_MEDICAL.filter((r) => r.petId === patient.petId).slice(0, 2)

  return (
    <div className="bg-card rounded-2xl p-5 space-y-5 overflow-y-auto">
      <div>
        <div className="flex items-baseline gap-3 mb-1">
          <h2 className="text-2xl font-bold">{patient.petName}</h2>
          <span className="text-muted-foreground text-sm">{patient.petBreed}</span>
        </div>
        <p className="text-sm text-muted-foreground mb-2">
          隊列號：<span className="font-bold text-primary">{patient.queueNum}</span>
          　到場：{patient.checkinTime}
        </p>
        <p className="text-sm">
          今日體重：<span className="text-primary font-bold text-lg">{patient.weight} kg</span>
        </p>
        {patient.allergies.length > 0 && (
          <div className="flex items-start gap-2 mt-3 p-3 bg-destructive/10 text-destructive rounded-lg">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-semibold mb-0.5">過敏史</p>
              <p>{patient.allergies.join('、')}</p>
            </div>
          </div>
        )}
      </div>

      <Collapsible title="最近病歷">
        {records.length === 0 ? (
          <p className="text-sm text-muted-foreground">無病歷紀錄</p>
        ) : (
          <div className="space-y-3">
            {records.map((r) => (
              <div key={r.id} className="text-sm border-b border-border pb-3 last:border-0 last:pb-0">
                <p className="font-semibold">{r.date}　{r.clinicName}</p>
                <p className="text-muted-foreground mt-0.5">診斷：{r.diagnosis}</p>
                {r.prescription.length > 0 && (
                  <ul className="mt-1 space-y-0.5 text-xs text-muted-foreground">
                    {r.prescription.map((rx, i) => (
                      <li key={i}>• {rx.medicine} {rx.dosage}　{rx.frequency}　{rx.days}天</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}
      </Collapsible>
    </div>
  )
}
