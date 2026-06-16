import type { Metadata } from 'next'
import { Toaster } from 'sonner'
import './globals.css'

export const metadata: Metadata = {
  title: 'TerryMon 平台管理後台',
  description: '預約怪獸 — 會員 / 商家 / 店鋪 / 金流管理',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-TW">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@400;500;700&family=Inter:wght@400;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans bg-surface text-ink antialiased">
        {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  )
}
