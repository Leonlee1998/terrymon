import { MOCK_APPOINTMENTS, MOCK_PETS } from '@/lib/mock'
import AppointmentsClient from '@/components/appointments/AppointmentsClient'

export default function AppointmentsPage() {
  return (
    <AppointmentsClient
      initialAppointments={MOCK_APPOINTMENTS}
      pets={MOCK_PETS}
    />
  )
}
