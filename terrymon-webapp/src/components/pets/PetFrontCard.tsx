'use client'

import Image from 'next/image'
import Barcode from 'react-barcode'
import type { Pet } from '@/types'
import { useAuthStore } from '@/stores/authStore'

function NfcWave() {
  return (
    <svg width="38" height="36" viewBox="0 -6 38 36" fill="none" aria-hidden>
      <circle cx="19" cy="28" r="2.2" fill="#f28400" />
      <path d="M12 22 Q19 14 26 22" stroke="#f28400" strokeWidth="2.4" fill="none" strokeLinecap="round" />
      <path d="M6 15 Q19 3 32 15"   stroke="#f28400" strokeWidth="2.4" fill="none" strokeLinecap="round" />
      <path d="M1 8  Q19 -8 37 8"   stroke="#f28400" strokeWidth="2.4" fill="none" strokeLinecap="round" />
    </svg>
  )
}

interface Props {
  pet: Pet
}

export default function PetFrontCard({ pet }: Props) {
  const { member } = useAuthStore()
  const barcodeValue = member?.handle ? `TM-${member.handle}` : pet.id.replace(/-/g, '').slice(0, 12).toUpperCase()

  return (
    <div className="relative flex h-full w-full flex-col items-center overflow-hidden bg-card-front">
      {/* ── Logo ── */}
      <div className="relative z-10 flex flex-col items-center pt-5">
        <Image
          src="/assets/logo.png"
          alt="TerryMon 預約怪獸"
          width={152}
          height={50}
          className="object-contain"
        />
        <p className="mt-2 text-sm font-bold tracking-[0.22em] text-gray-600">專屬會員卡</p>
      </div>

      {/* ── Barcode ── */}
      <div className="relative z-10 mt-4 flex flex-col items-center">
        <Barcode
          value={barcodeValue}
          lineColor="#f28400"
          background="transparent"
          width={1.4}
          height={52}
          displayValue={false}
          margin={0}
        />
        <p className="mt-1 text-[11px] font-bold tracking-[0.18em] text-card-orange">{barcodeValue}</p>
      </div>

      {/* ── Illustrations + NFC ── */}
      <div className="relative mt-2 flex-1 w-full overflow-hidden">
        {/* Dog 1 – left */}
        <div className="absolute bottom-0 left-[-6%] h-[92%] w-[58%]">
          <Image
            src="/assets/dog1.png"
            alt=""
            fill
            className="object-contain object-left-bottom"
            sizes="160px"
          />
        </div>

        {/* Dog 2 – right */}
        <div className="absolute bottom-0 right-[-6%] h-[92%] w-[58%]">
          <Image
            src="/assets/dog2.png"
            alt=""
            fill
            className="object-contain object-right-bottom"
            sizes="160px"
          />
        </div>

        {/* NFC – centre */}
        <div className="absolute left-1/2 top-3 -translate-x-1/2 flex flex-col items-center">
          <NfcWave />
          <p className="mt-0.5 text-[11px] font-black tracking-[0.2em] text-card-orange">NFC</p>
          <p className="text-[9px] tracking-[0.28em] text-card-orange">輕觸感應</p>
        </div>
      </div>
    </div>
  )
}
