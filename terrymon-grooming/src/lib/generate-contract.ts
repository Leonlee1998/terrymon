'use client'
import type { RefObject } from 'react'

// Capture the contract HTML block (single scrollable div) and slice into A4 pages.
export async function generateContractPdf(containerRef: RefObject<HTMLDivElement | null>): Promise<Blob> {
  const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
    import('html2canvas'),
    import('jspdf'),
  ])

  const container = containerRef.current
  if (!container) throw new Error('Contract container not found')

  const canvas = await html2canvas(container, {
    scale: 2,
    useCORS: true,
    backgroundColor: '#ffffff',
    logging: false,
    windowWidth: 794,
  })

  const A4_W_MM = 210
  const A4_H_MM = 297
  // pixels per A4 page at scale=2: canvas.width corresponds to 210mm
  const pageHeightPx = Math.round((A4_H_MM * canvas.width) / A4_W_MM)
  const pageCount = Math.ceil(canvas.height / pageHeightPx)

  const pdf = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' })

  for (let i = 0; i < pageCount; i++) {
    if (i > 0) pdf.addPage()
    const sliceCanvas = document.createElement('canvas')
    sliceCanvas.width = canvas.width
    sliceCanvas.height = pageHeightPx
    const ctx = sliceCanvas.getContext('2d')!
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, sliceCanvas.width, sliceCanvas.height)
    ctx.drawImage(canvas, 0, i * pageHeightPx, canvas.width, pageHeightPx, 0, 0, canvas.width, pageHeightPx)
    pdf.addImage(sliceCanvas.toDataURL('image/jpeg', 0.9), 'JPEG', 0, 0, A4_W_MM, A4_H_MM)
  }

  return pdf.output('blob')
}

export async function notifyLineContract(params: {
  memberName: string
  petName: string
  services: string[]
  totalPrice: number
  contractUrl: string
}): Promise<void> {
  const message =
    `\n🐾 TerryMon 寵物美容 — 服務合約\n` +
    `飼主：${params.memberName}\n` +
    `寵物：${params.petName}\n` +
    `服務：${params.services.join('、')}\n` +
    `費用：NT$ ${params.totalPrice.toLocaleString()}\n` +
    `合約連結：${params.contractUrl}`

  try {
    await fetch('/api/line-notify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
    })
  } catch {
    console.log('[LINE Notify mock]', message)
  }
}
