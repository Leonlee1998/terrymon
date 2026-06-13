'use client'
import type { RefObject } from 'react'

export async function generateContractPdf(containerRef: RefObject<HTMLDivElement | null>): Promise<Blob> {
  const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
    import('html2canvas'),
    import('jspdf'),
  ])

  const container = containerRef.current
  if (!container) throw new Error('Contract container not found')

  // Array.from(children) — querySelectorAll('& > div') is invalid in DOM API
  const pages = Array.from(container.children) as HTMLElement[]
  if (pages.length === 0) throw new Error('No pages found in contract')

  const pdf = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' })

  for (let i = 0; i < pages.length; i++) {
    if (i > 0) pdf.addPage()
    const canvas = await html2canvas(pages[i], {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false,
      windowWidth: 794,
    })
    const imgData = canvas.toDataURL('image/jpeg', 0.9)
    pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297)
  }

  return pdf.output('blob')
}

export async function uploadContractToStorage(blob: Blob, documentId: string): Promise<string> {
  try {
    const { ref: storageRef, uploadBytes, getDownloadURL } = await import('firebase/storage')
    const { storage } = await import('./firebase')
    const r = storageRef(storage, `contracts/${documentId}.pdf`)
    await uploadBytes(r, blob, { contentType: 'application/pdf' })
    return getDownloadURL(r)
  } catch {
    // Firebase not configured — return a local object URL as fallback
    return URL.createObjectURL(blob)
  }
}

export async function saveContractToFirestore(data: {
  memberId: string
  petId: string
  services: string[]
  totalPrice: number
  contractUrl: string
  documentId: string
  createdAt: string
}): Promise<void> {
  try {
    const { collection, addDoc } = await import('firebase/firestore')
    const { db } = await import('./firebase')
    await addDoc(collection(db, 'contracts'), data)
  } catch {
    console.log('[Firestore mock] contract saved:', data.documentId)
  }
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
