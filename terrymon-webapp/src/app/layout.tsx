import type { Metadata } from 'next'
import type React from 'react'
import { Toaster } from 'sonner'
import './globals.css'

export const metadata: Metadata = {
  title: 'TerryMon 寵物會員',
  description: '寵物會員、醫療與美容紀錄管理',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
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
