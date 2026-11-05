'use client'

import type { BgLayer } from '@/lib/parseCss'
import { Eye, EyeClosed } from 'lucide-react'
import { motion } from 'motion/react'
import { useState } from 'react'
import { PreviewCanvas } from '@/app/_components/PreviewCanvas'
import { cn } from '@/lib/utils'
import { ColorDot } from './ColorDot'

interface Props {
  layer: BgLayer
  colorHidden: boolean
  isActive?: boolean
  onToggleVisibility: () => void
  onUpdate: (field: keyof BgLayer, value: string) => void
}

export function BackgroundColorCard({ layer, colorHidden, isActive, onToggleVisibility, onUpdate }: Props) {
  const [editing, setEditing] = useState(false)

  return (
    <div
      data-layer-key="color"
      className={cn(
        'shrink-0 rounded-md border bg-canvas overflow-hidden transition-[opacity,border-color]',
        isActive ? 'border-accent' : 'border-line',
        colorHidden && 'opacity-40',
      )}
    >
      <div className="px-3.5 py-2 border-b border-line bg-surface flex items-center justify-between">
        <span className="text-xs font-medium text-ink-muted">background-color</span>
        <motion.button
          onClick={onToggleVisibility}
          className="text-ink-muted hover:text-ink transition-colors cursor-pointer hit-area-3"
          aria-label={colorHidden ? 'Show color' : 'Hide color'}
          whileTap={{ scale: 0.8 }}
          whileHover={{ scale: 1.15 }}
          transition={{ duration: 0.12 }}
        >
          {colorHidden ? <EyeClosed size={14} /> : <Eye size={14} />}
        </motion.button>
      </div>
      <div className="flex">
        <div className="w-20 min-h-20 shrink-0 border-r border-line overflow-hidden">
          <PreviewCanvas
            css={`div { background: ${layer.color}; }`}
            className="w-full h-full"
          />
        </div>
        <div className={cn('flex-1 px-3.5 py-3 min-w-0 flex items-center', colorHidden && 'pointer-events-none')}>
          {!editing && (
            <ColorDot
              colorStr={layer.color!}
              onPick={(hex) => onUpdate('color', hex)}
            />
          )}
          <input
            className="select-text font-mono text-xs text-ink w-full bg-transparent outline-none rounded px-1.5 py-1 -mx-1.5 hover:bg-surface focus:bg-surface focus-visible:ring-1 focus-visible:ring-accent/40 transition-colors disabled:pointer-events-none"
            value={layer.color!}
            onChange={(e) => onUpdate('color', e.target.value)}
            onFocus={() => setEditing(true)}
            onBlur={() => setEditing(false)}
            spellCheck={false}
            disabled={colorHidden}
          />
        </div>
      </div>
    </div>
  )
}
