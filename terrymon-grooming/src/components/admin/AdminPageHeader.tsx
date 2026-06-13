interface Props { title: string; subtitle?: string; action?: React.ReactNode }

export default function AdminPageHeader({ title, subtitle, action }: Props) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-2xl font-black text-ink">{title}</h1>
        {subtitle && <p className="text-slate-t text-sm mt-0.5">{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}
