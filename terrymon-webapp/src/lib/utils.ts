import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function calcAge(birthDate: string): string {
  const birth = new Date(birthDate)
  const now = new Date()
  const years = now.getFullYear() - birth.getFullYear()
  const months = now.getMonth() - birth.getMonth() +
    (now.getDate() < birth.getDate() ? -1 : 0)
  if (years === 0) return `${((months + 12) % 12)} 個月`
  if (months < 0) return `${years - 1} 歲 ${months + 12} 個月`
  return months === 0 ? `${years} 歲` : `${years} 歲 ${months} 個月`
}

export function formatDate(dateStr: string, format: 'short' | 'full' = 'short'): string {
  const d = new Date(dateStr)
  if (format === 'full') {
    return d.toLocaleDateString('zh-TW', {
      year: 'numeric', month: 'long', day: 'numeric', weekday: 'short',
    })
  }
  return d.toLocaleDateString('zh-TW', { year: 'numeric', month: '2-digit', day: '2-digit' })
}

export function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' })
}

export function formatPrice(price: number): string {
  return `NT$ ${price.toLocaleString()}`
}

export function formatFileSize(size: string): string {
  return size
}

export function getSpeciesEmoji(species: string): string {
  return species === 'dog' ? '🐕' : species === 'cat' ? '🐈' : '🐾'
}

export function getDeviceIcon(type: string): string {
  const map: Record<string, string> = {
    camera: '📷', glucose: '🩸', bp_monitor: '💓',
    thermometer: '🌡️', scale: '⚖️',
  }
  return map[type] ?? '📡'
}

export function getDeviceLabel(type: string): string {
  const map: Record<string, string> = {
    camera: '攝影機', glucose: '血糖機', bp_monitor: '血壓計',
    thermometer: '體溫計', scale: '體重秤',
  }
  return map[type] ?? '裝置'
}

export function getTrend(data: { value: number }[]): '↑' | '↓' | '→' {
  if (data.length < 2) return '→'
  const last = data[data.length - 1].value
  const prev = data[data.length - 2].value
  if (last > prev + 0.1) return '↑'
  if (last < prev - 0.1) return '↓'
  return '→'
}
