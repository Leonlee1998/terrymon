'use client'
import { useRef, useState } from 'react'

interface Props {
  images: string[]
  alt: string
}

export default function ImageGallery({ images, alt }: Props) {
  const [activeIndex, setActiveIndex] = useState(0)
  const scrollRef = useRef<HTMLDivElement>(null)
  const imgs = images.length ? images : ['/placeholder.png']

  function handleScroll() {
    if (!scrollRef.current) return
    const idx = Math.round(scrollRef.current.scrollLeft / scrollRef.current.offsetWidth)
    setActiveIndex(idx)
  }

  function scrollTo(i: number) {
    if (!scrollRef.current) return
    scrollRef.current.scrollTo({ left: i * scrollRef.current.offsetWidth, behavior: 'smooth' })
  }

  return (
    <div className="relative w-full aspect-[4/3] overflow-hidden bg-surface select-none sm:aspect-[16/10] md:max-h-[380px]">
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex overflow-x-auto snap-x snap-mandatory w-full h-full"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {imgs.map((src, i) => (
          <div key={i} className="snap-start shrink-0 w-full h-full">
            <img
              src={src}
              alt={`${alt} ${i + 1}`}
              className="h-full w-full object-cover"
              draggable={false}
            />
          </div>
        ))}
      </div>

      {imgs.length > 1 && (
        <>
          <div className="absolute bottom-3 inset-x-0 flex justify-center gap-1.5 pointer-events-none">
            {imgs.map((_, i) => (
              <button
                key={i}
                onClick={() => scrollTo(i)}
                className={`rounded-full transition-all pointer-events-auto ${i === activeIndex ? 'bg-white w-4 h-1.5' : 'bg-white/60 w-1.5 h-1.5'}`}
              />
            ))}
          </div>
          <span className="absolute top-3 right-3 bg-black/40 text-white text-xs px-2 py-0.5 rounded-full tabular-nums">
            {activeIndex + 1} / {imgs.length}
          </span>
        </>
      )}
    </div>
  )
}
