import HomeHeader from '@/components/home/HomeHeader'
import WelcomeCard from '@/components/home/WelcomeCard'
import BarcodeWidget from '@/components/home/BarcodeWidget'
import TodaySchedule from '@/components/home/TodaySchedule'
import AIoTDashboard from '@/components/home/AIoTDashboard'
import QuickActions from '@/components/home/QuickActions'
import HealthAlerts from '@/components/home/HealthAlerts'
import { api } from '@/services/api'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const [member, pets, appointments] = await Promise.all([
    api.getMe(),
    api.getPets(),
    api.getAppointments(),
  ])
  const pet = pets[0] ?? member.pets[0]
  const [healthData, devices] = pet
    ? await Promise.all([
        api.getHealthData(pet.id),
        api.getDevices(pet.id),
      ])
    : [null, []]
  const todayAppt = appointments.find(a =>
    a.status === 'confirmed' && new Date(a.date) >= new Date()
  ) ?? null

  return (
    <div className="flex flex-col animate-fade-in">
      <HomeHeader />
      <div className="p-4 space-y-4 max-w-2xl mx-auto w-full">
        <WelcomeCard member={member} appointment={todayAppt} />
        <BarcodeWidget member={member} />
        {pet && healthData && <HealthAlerts pet={pet} healthData={healthData} />}
        <TodaySchedule appointment={todayAppt} />
        {pet && healthData && <AIoTDashboard pet={pet} devices={devices} healthData={healthData} />}
        <QuickActions />
      </div>
    </div>
  )
}
