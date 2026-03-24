'use client'

import type { BgLayer } from '@/lib/parseCss'
import { Eye, EyeClosed } from 'lucide-react'
import { motion } from 'motion/react'
import { PreviewCanvas } from '@/app/_components/PreviewCanvas'
import { cn } from '@/lib/utils'

interface Props {
  layer: BgLayer
  colorHidden: boolean
  onToggleVisibility: () => void
  onUpdate: (field: keyof BgLayer, value: string) => void
}

export function BackgroundColorCard({ layer, colorHidden, onToggleVisibility, onUpdate }: Props) {
  return (
    <div
      className={cn(
        'shrink-0 rounded-md border border-line bg-canvas overflow-hidden transition-opacity',
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
        <div className="flex-1 px-3.5 py-3 min-w-0 flex items-center">
          <input
            className="select-text font-mono text-xs text-ink w-full bg-transparent outline-none rounded px-1.5 py-1 -mx-1.5 hover:bg-surface focus:bg-surface focus-visible:ring-1 focus-visible:ring-accent/40 transition-colors disabled:pointer-events-none"
            value={layer.color!}
            onChange={e => onUpdate('color', e.target.value)}
            spellCheck={false}
            disabled={colorHidden}
          />
        </div>
      </div>
    </div>
  )
}
