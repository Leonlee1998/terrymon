import Link from 'next/link'

const ACTIONS = [
  { href: '/appointments', emoji: '🏥', label: '掛號預約', color: 'bg-primary-bg' },
  { href: '/appointments', emoji: '✂️', label: '美容預約', color: 'bg-accent-light' },
  { href: '/shop',         emoji: '🛒', label: '購買用品', color: 'bg-blue-50' },
  { href: '/pets',         emoji: '📋', label: '健康紀錄', color: 'bg-purple-50' },
]

export default function QuickActions() {
  return (
    <div>
      <h3 className="font-semibold text-sm text-ink mb-3">快速功能</h3>
      <div className="grid grid-cols-4 gap-3">
        {ACTIONS.map(({ href, emoji, label, color }) => (
          <Link
            key={label}
            href={href}
            className={`flex flex-col items-center gap-2 p-3 rounded-2xl ${color} border border-border-t hover:scale-95 transition-transform active:scale-90`}
          >
            <span className="text-2xl">{emoji}</span>
            <span className="text-[11px] font-medium text-ink text-center leading-tight">{label}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
