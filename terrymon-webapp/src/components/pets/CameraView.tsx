'use client'
import { Video, VideoOff } from 'lucide-react'
import type { AIoTDevice } from '@/types'

export default function CameraView({ devices }: { devices: AIoTDevice[] }) {
  const cameras = devices.filter(d => d.type === 'camera')
  const onlineCam = cameras.find(c => c.status === 'online')

  if (cameras.length === 0) return null

  return (
    <div className="bg-white rounded-2xl border border-border-t p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-semibold text-sm text-ink">攝影機</h4>
        <span className={`flex items-center gap-1 text-xs font-medium ${
          onlineCam ? 'text-primary' : 'text-slate-t'
        }`}>
          {onlineCam ? (
            <>
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              即時直播
            </>
          ) : (
            <>
              <span className="w-1.5 h-1.5 rounded-full bg-slate-t" />
              離線中
            </>
          )}
        </span>
      </div>

      <div className="rounded-xl overflow-hidden bg-gray-900 aspect-video flex items-center justify-center">
        {onlineCam ? (
          <div className="relative w-full h-full flex items-center justify-center">
            <div className="text-white/30 text-sm flex flex-col items-center gap-2">
              <Video size={32} />
              <span>攝影機串流</span>
              <span className="text-[10px]">（正式版接入裝置 SDK）</span>
            </div>
            <span className="absolute top-3 left-3 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
              LIVE
            </span>
            <span className="absolute top-3 right-3 text-white/60 text-[10px]">
              {onlineCam.name}
            </span>
          </div>
        ) : (
          <div className="text-white/30 text-sm flex flex-col items-center gap-2">
            <VideoOff size={32} />
            <span>攝影機離線</span>
          </div>
        )}
      </div>
    </div>
  )
}
