import { toast } from 'sonner'
import type { QueueItem } from '@/types'
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

type RxRow = { medicine: string; dosage: string; frequency: string; days: number }

type FormValues = {
  diagnosis?: string
  prescriptions?: RxRow[]
  notes?: string
  needsFollowUp?: boolean
  followUpDate?: string
}

export default function PrescriptionModal({
  open, onClose, patient, formValues,
}: {
  open: boolean
  onClose: () => void
  patient: QueueItem
  formValues: FormValues
}) {
  const rxList = formValues.prescriptions ?? []

  function handlePrint() {
    toast.success('藥單已傳送至列印佇列')
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose() }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>藥單預覽</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 text-sm">
          <div className="grid grid-cols-2 gap-2 p-3 bg-muted/30 rounded-lg">
            <div><span className="text-muted-foreground">病患：</span>{patient.petName}</div>
            <div><span className="text-muted-foreground">品種：</span>{patient.petBreed}</div>
            <div><span className="text-muted-foreground">隊列號：</span>{patient.queueNum}</div>
            <div><span className="text-muted-foreground">體重：</span>{patient.weight} kg</div>
          </div>

          <div>
            <p className="font-semibold mb-1">診斷</p>
            <p className="p-2 bg-muted/30 rounded">{formValues.diagnosis || '—'}</p>
          </div>

          {rxList.length > 0 && (
            <div>
              <p className="font-semibold mb-2">處方</p>
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="bg-muted/50">
                    {['藥名', '劑量', '頻次', '天數'].map((h) => (
                      <th key={h} className="px-2 py-1 text-left border border-border">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rxList.map((rx, i) => (
                    <tr key={i}>
                      <td className="px-2 py-1 border border-border">{rx.medicine}</td>
                      <td className="px-2 py-1 border border-border">{rx.dosage}</td>
                      <td className="px-2 py-1 border border-border">{rx.frequency}</td>
                      <td className="px-2 py-1 border border-border">{rx.days}天</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {formValues.needsFollowUp && formValues.followUpDate && (
            <p><span className="text-muted-foreground">複診日期：</span>{formValues.followUpDate}</p>
          )}
          {formValues.notes && (
            <p><span className="text-muted-foreground">備注：</span>{formValues.notes}</p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>關閉</Button>
          <Button onClick={handlePrint}>列印藥單</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
