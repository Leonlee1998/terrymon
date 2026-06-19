import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: number): string {
  return `NT$ ${price.toLocaleString()}`
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('zh-TW', { year: 'numeric', month: '2-digit', day: '2-digit' })
}

export function formatTime(isoStr: string): string {
  const d = new Date(isoStr)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  if (diffMin < 1)  return '剛剛'
  if (diffMin < 60) return `${diffMin} 分鐘前`
  const diffH = Math.floor(diffMin / 60)
  if (diffH < 24)   return `${diffH} 小時前`
  const isSameYear = d.getFullYear() === now.getFullYear()
  return d.toLocaleDateString('zh-TW', { month: '2-digit', day: '2-digit', ...(isSameYear ? {} : { year: 'numeric' }) })
}

export function getSpeciesEmoji(species: string): string {
  return species === 'dog' ? '🐕' : species === 'cat' ? '🐈' : '🐾'
}

export function calcAge(birthDate: string): string {
  const birth = new Date(birthDate)
  const now = new Date()
  const totalMonths = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth())
  if (totalMonths < 12) return `${totalMonths} 個月`
  const y = Math.floor(totalMonths / 12)
  const m = totalMonths % 12
  return m > 0 ? `${y} 歲 ${m} 個月` : `${y} 歲`
}
