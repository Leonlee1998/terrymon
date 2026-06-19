import AppointmentsClient from '@/components/appointments/AppointmentsClient'
import { api } from '@/services/api'

export const dynamic = 'force-dynamic'

export default async function AppointmentsPage() {
  const [appointments, pets] = await Promise.all([
    api.listMyAppointments(),
    api.getPets(),
  ])

  return (
    <AppointmentsClient
      initialAppointments={appointments}
      pets={pets}
    />
  )
}
