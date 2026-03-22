'use client'

import { Eye, EyeClosed, GripVertical } from 'lucide-react'
import { motion, type DragControls } from 'motion/react'
import { PreviewCanvas } from '@/app/_components/PreviewCanvas'
import type { BgLayer } from '@/lib/parseCss'
import { cn } from '@/lib/utils'

/**
 * Build a self-contained CSS snippet to preview a single layer.
 * Preserves CSS custom properties from the original input.
 */
function buildLayerCss(layer: BgLayer, originalCss: string): string {
  const block = originalCss.trim().match(/\{([\s\S]*)\}/)
  const inner = block ? block[1] : originalCss

  const customProps = [...inner.matchAll(/(--[\w-]+\s*:[^;]+)/g)]
    .map((m) => m[1].trim())
    .join('; ')

  const bgValue = layer.raw === 'none' ? 'none' : layer.raw
  return `div { ${customProps ? `${customProps}; ` : ''}background: ${bgValue} }`
}

const SUB_PROP_FIELDS: { label: string; key: keyof BgLayer }[] = [
  { label: 'position', key: 'position' },
  { label: 'size', key: 'size' },
  { label: 'repeat', key: 'repeat' },
  { label: 'attachment', key: 'attachment' },
  { label: 'origin', key: 'origin' },
  { label: 'clip', key: 'clip' },
  { label: 'blend-mode', key: 'blendMode' },
  { label: 'color', key: 'color' },
]

export function LayerCard({
  layer,
  order,
  total,
  originalCss,
  isVisible,
  onToggleVisibility,
  onUpdate,
  dragControls,
}: {
  layer: BgLayer
  order: number
  total: number
  originalCss: string
  isVisible: boolean
  onToggleVisibility: () => void
  onUpdate: (field: keyof BgLayer, value: string) => void
  dragControls: DragControls
}) {
  const layerCss = buildLayerCss(layer, originalCss)

  const displayNumber =
    order === 0
      ? `1 - top`
      : order === total - 1
        ? `${total} - bottom`
        : order + 1

  const subProps = SUB_PROP_FIELDS.filter(({ key }) => layer[key] != null)

  return (
    <div
      className={cn(
        'rounded-md border border-line overflow-hidden bg-canvas transition-opacity select-none',
        !isVisible && 'opacity-40',
      )}
    >
      {/* Header row */}
      <div className="px-3.5 py-2 border-b border-line bg-surface flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GripVertical
            size={14}
            className="text-ink-muted/50 hover:text-ink-muted cursor-grab active:cursor-grabbing touch-none"
            onPointerDown={(e) => dragControls.start(e)}
          />
          <span className="text-xs font-medium text-ink-muted tabular-nums">
            {displayNumber}
          </span>
        </div>
        <motion.button
          onClick={onToggleVisibility}
          className="text-ink-muted hover:text-ink transition-colors cursor-pointer hit-area-3"
          aria-label={isVisible ? 'Hide layer' : 'Show layer'}
          whileTap={{ scale: 0.8 }}
          whileHover={{ scale: 1.15 }}
          transition={{ duration: 0.12 }}
        >
          {isVisible ? <Eye size={14} /> : <EyeClosed size={14} />}
        </motion.button>
      </div>

      {/* Body: square preview + content */}
      <div className="flex">
        {/* Square swatch */}
        <div className="w-20 min-h-20 shrink-0 border-r border-line overflow-hidden">
          <PreviewCanvas css={layerCss} className="w-full h-full" />
        </div>

        {/* Raw value + sub-props */}
        <div className="flex-1 px-3.5 py-3 min-w-0 flex flex-col gap-2">
          <textarea
            className="select-text font-mono text-xs leading-relaxed text-ink w-full bg-transparent outline-none rounded px-1.5 py-1 -mx-1.5 hover:bg-surface focus:bg-surface transition-colors resize-none break-all"
            style={{ fieldSizing: 'content' } as React.CSSProperties}
            value={layer.raw}
            onChange={(e) => onUpdate('raw', e.target.value)}
            spellCheck={false}
            rows={1}
          />
          {subProps.length > 0 && (
            <div>
              {subProps.map(({ label, key }) => (
                <div key={label} className="flex gap-2 text-xs items-center">
                  <span className="text-ink-muted shrink-0 w-20">{label}</span>
                  <input
                    className="select-text font-mono text-ink flex-1 min-w-0 bg-transparent outline-none rounded px-1.5 py-1 -mx-1.5 hover:bg-surface focus:bg-surface transition-colors"
                    value={layer[key] as string}
                    onChange={(e) => onUpdate(key, e.target.value)}
                    spellCheck={false}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
