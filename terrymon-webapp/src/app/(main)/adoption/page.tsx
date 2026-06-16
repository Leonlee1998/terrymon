import { redirect } from 'next/navigation'
import { api } from '@/services/api'
import AdoptionManageClient from '@/components/pets/AdoptionManageClient'

export const dynamic = 'force-dynamic'

export default async function AdoptionPage() {
  const org = await api.getMyOrganization()
  if (!org || org.status !== 'approved') redirect('/member')

  const plans = await api.getMyAdoptionPlans(org.id)
  const pets = await api.getPets()

  return <AdoptionManageClient org={org} plans={plans} pets={pets} />
}
