import { MOCK_MEMBER, MOCK_PETS, MOCK_APPOINTMENTS, MOCK_MEDICAL, MOCK_HEALTH_DATA, MOCK_DEVICES } from '@/lib/mock'
import HomeHeader from '@/components/home/HomeHeader'
import WelcomeCard from '@/components/home/WelcomeCard'
import TodaySchedule from '@/components/home/TodaySchedule'
import AIoTDashboard from '@/components/home/AIoTDashboard'
import QuickActions from '@/components/home/QuickActions'
import HealthAlerts from '@/components/home/HealthAlerts'

export default function HomePage() {
  const member = { ...MOCK_MEMBER, pets: MOCK_PETS }
  const pet = MOCK_PETS[0]
  const todayAppt = MOCK_APPOINTMENTS.find(a =>
    a.status === 'confirmed' && new Date(a.date) >= new Date()
  ) ?? null
  const latestMedical = MOCK_MEDICAL.filter(r => r.petId === pet.id)[0]

  return (
    <div className="flex flex-col animate-fade-in">
      <HomeHeader />
      <div className="p-4 space-y-4 max-w-2xl mx-auto w-full">
        <WelcomeCard member={member} appointment={todayAppt} />
        <HealthAlerts pet={pet} healthData={MOCK_HEALTH_DATA} />
        <TodaySchedule appointment={todayAppt} />
        <AIoTDashboard pet={pet} devices={MOCK_DEVICES} healthData={MOCK_HEALTH_DATA} />
        <QuickActions />
      </div>
    </div>
  )
}
