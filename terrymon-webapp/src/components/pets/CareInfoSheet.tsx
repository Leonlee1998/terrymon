'use client'

import { useEffect, useState } from 'react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
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
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="max-h-[85vh] overflow-y-auto rounded-t-3xl px-5 pb-10 pt-2"
      >
        <SheetHeader className="mb-5 pt-2">
          <SheetTitle className="text-left text-lg font-black text-ink">
            {pet.name} 的照護資訊
          </SheetTitle>
        </SheetHeader>

        {loading ? (
          <div className="space-y-3">
            <div className="h-20 animate-pulse rounded-xl bg-surface" />
            <div className="h-20 animate-pulse rounded-xl bg-surface" />
          </div>
        ) : (
          <div className="space-y-7">
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
      </SheetContent>
    </Sheet>
  )
}
