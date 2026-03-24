'use client'

import { sendGAEvent } from '@next/third-parties/google'
import { cn } from '@/lib/utils'

export const ASPECT_RATIOS = [
  { label: '16:9', ratio: '16 / 9' },
  { label: '4:3', ratio: '4 / 3' },
  { label: '1:1', ratio: '1 / 1' },
  { label: '9:16', ratio: '9 / 16' },
] as const

export type AspectRatio = (typeof ASPECT_RATIOS)[number]

interface Props {
  current: AspectRatio
  onChange: (ratio: AspectRatio) => void
}

export function AspectRatioPicker({ current, onChange }: Props) {
  return (
    <div className="flex justify-center items-center gap-1 shrink-0">
      {ASPECT_RATIOS.map(r => (
        <button
          key={r.label}
          onClick={() => {
            sendGAEvent('event', 'change_aspect_ratio', { name: r.label })
            onChange(r)
          }}
          className={cn(
            'px-2.5 py-1 rounded text-xs font-mono transition-colors cursor-pointer',
            r.label === current.label
              ? 'bg-accent text-white'
              : 'text-ink-muted hover:text-ink hover:bg-surface',
          )}
        >
          {r.label}
        </button>
      ))}
    </div>
  )
}
