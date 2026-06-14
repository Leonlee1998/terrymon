import Link from 'next/link'
import { Clock } from 'lucide-react'

export default function PendingPage() {
  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl p-10 w-full max-w-sm shadow-xl text-center">
        <div className="w-16 h-16 bg-yellow-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Clock size={28} className="text-yellow-600" />
        </div>
        <h1 className="text-2xl font-black text-ink mb-2">審核中</h1>
        <p className="text-slate-t text-sm leading-relaxed">
          您的申請已送出，我們會在 3–5 個工作天內完成審核。
          <br />審核通過後將以 Email 通知您。
        </p>
        <Link href="/login" className="inline-block mt-6 text-sm text-primary font-medium hover:underline">
          返回登入頁
        </Link>
      </div>
    </div>
  )
}
