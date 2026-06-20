'use client'

import { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { api } from '@/services/api'
import type { EmergencyContact, Pet, PetCaregiver } from '@/types'
import EmergencyContactsSection from './EmergencyContactsSection'
import CoCaregiversSection from './CoCaregiversSection'

export default function CareInfoSheet({
  pet,
  open,
  onOpenChange,
}: {
  pet: Pet
  open: boolean
  onOpenChange: (o: boolean) => void
}) {
  const [contacts, setContacts] = useState<EmergencyContact[]>([])
  const [caregivers, setCaregivers] = useState<PetCaregiver[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!open) return
    setLoading(true)
    Promise.all([
      api.getEmergencyContacts(pet.id),
      api.getCaregivers(pet.id),
    ])
      .then(([c, cg]) => { setContacts(c); setCaregivers(cg) })
      .finally(() => setLoading(false))
  }, [open, pet.id])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-left text-lg font-black text-ink">
            {pet.name} 的照護資訊
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="space-y-3 py-2">
            <div className="h-20 animate-pulse rounded-xl bg-surface" />
            <div className="h-20 animate-pulse rounded-xl bg-surface" />
          </div>
        ) : (
          <div className="space-y-7 pb-2">
            <EmergencyContactsSection
              petId={pet.id}
              contacts={contacts}
              onUpdate={setContacts}
            />
            <CoCaregiversSection
              petId={pet.id}
              caregivers={caregivers}
              onUpdate={setCaregivers}
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
