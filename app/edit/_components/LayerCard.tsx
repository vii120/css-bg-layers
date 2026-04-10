'use client'

import type { DragControls } from 'motion/react'
import type { BgLayer } from '@/lib/parseCss'
import Colorful from '@uiw/react-color-colorful'
import { hexToHsva, type HsvaColor } from '@uiw/color-convert'
import { sendGAEvent } from '@next/third-parties/google'
import { Eye, EyeClosed, GripVertical } from 'lucide-react'
import { motion } from 'motion/react'
import { useCallback, useMemo, useState } from 'react'
import { PreviewCanvas } from '@/app/_components/PreviewCanvas'
import { reconstructBackground } from '@/lib/parseCss'
import { cssColorToHex, parseColorTokens } from '@/lib/colorUtils'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'

function buildLayerCss(
  layer: BgLayer,
  cssVars: { name: string; value: string }[],
): string {
  const customProps = cssVars.map((v) => `${v.name}: ${v.value}`).join('; ')
  const bgValue = reconstructBackground([layer])
  return `div { ${customProps ? `${customProps}; ` : ''}background: ${bgValue} }`
}

function ColorDot({
  colorStr,
  onPick,
}: {
  colorStr: string
  onPick: (hex: string) => void
}) {
  const hex = useMemo(() => cssColorToHex(colorStr, true), [colorStr])
  // Store as HSVA so the picker controls move correctly AND hue is preserved —
  // passing hex would re-derive HSV on every render, losing hue for near-grays.
  const [hsva, setHsva] = useState<HsvaColor>(() =>
    hexToHsva(cssColorToHex(colorStr)),
  )

  return (
    <Popover onOpenChange={(open) => {
      if (open) setHsva(hexToHsva(cssColorToHex(colorStr)))
    }}>
      <PopoverTrigger asChild onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          title={colorStr}
          style={{ backgroundColor: hex }}
          className="w-2.5 aspect-square rounded-[2px] border border-black/20 cursor-pointer inline-block align-middle mr-1 relative -top-px hover:scale-125 transition-transform duration-100"
        />
      </PopoverTrigger>
      <PopoverContent
        className="p-0 w-auto border-none shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="box-content **:box-content">
          <Colorful
            color={hsva}
            onChange={(color) => {
              setHsva(color.hsva)
              onPick(color.hexa.endsWith('ff') ? color.hex : color.hexa)
            }}
          />
        </div>
      </PopoverContent>
    </Popover>
  )
}

function RawDisplay({
  value,
  onStartEdit,
  onColorPick,
}: {
  value: string
  onStartEdit: () => void
  onColorPick: (start: number, end: number, hex: string) => void
}) {
  const tokens = useMemo(() => parseColorTokens(value), [value])

  let content: React.ReactNode
  if (tokens.length === 0) {
    content = value
  } else {
    const parts: React.ReactNode[] = []
    let last = 0
    for (const tok of tokens) {
      if (tok.start > last) {
        parts.push(
          <span key={`t-${last}`}>{value.slice(last, tok.start)}</span>,
        )
      }
      parts.push(
        <span key={`c-${tok.start}`}>
          <ColorDot
            colorStr={tok.raw}
            onPick={(hex) => onColorPick(tok.start, tok.end, hex)}
          />
          {tok.raw}
        </span>,
      )
      last = tok.end
    }
    if (last < value.length) {
      parts.push(<span key={`t-${last}`}>{value.slice(last)}</span>)
    }
    content = parts
  }

  return (
    <div
      className="select-text font-mono text-xs leading-relaxed text-ink w-full rounded px-1.5 py-1 -mx-1.5 hover:bg-surface cursor-text break-all max-h-25 overflow-y-auto"
      onClick={onStartEdit}
    >
      {content}
    </div>
  )
}

const SUB_PROP_FIELDS: { label: string; key: keyof BgLayer }[] = [
  { label: 'position', key: 'position' },
  { label: 'size', key: 'size' },
  { label: 'repeat', key: 'repeat' },
  { label: 'attachment', key: 'attachment' },
  { label: 'origin', key: 'origin' },
  { label: 'clip', key: 'clip' },
  { label: 'blend-mode', key: 'blendMode' },
]

export function LayerCard({
  layer,
  order,
  total,
  cssVars,
  isVisible,
  onToggleVisibility,
  onUpdate,
  dragControls,
}: {
  layer: BgLayer
  order: number
  total: number
  cssVars: { name: string; value: string }[]
  isVisible: boolean
  onToggleVisibility: () => void
  onUpdate: (field: keyof BgLayer, value: string) => void
  dragControls: DragControls
}) {
  const layerCss = buildLayerCss(layer, cssVars)
  const [isEditing, setIsEditing] = useState(false)

  const handleColorPick = useCallback(
    (start: number, end: number, hex: string) => {
      onUpdate('raw', layer.raw.slice(0, start) + hex + layer.raw.slice(end))
    },
    [layer.raw, onUpdate],
  )

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
          <span
            className="hit-area-2 touch-none cursor-grab active:cursor-grabbing"
            onPointerDown={(e) => {
              dragControls.start(e)
              sendGAEvent('event', 'drag_layer')
            }}
          >
            <GripVertical
              size={14}
              className="text-ink-muted/50 hover:text-ink-muted pointer-events-none"
            />
          </span>
          <span className="text-xs font-medium text-ink-muted tabular-nums">
            {displayNumber}
          </span>
        </div>
        <motion.button
          onClick={() => {
            sendGAEvent('event', 'toggle_layer_visibility')
            onToggleVisibility()
          }}
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
      <div className={cn('flex', !isVisible && 'pointer-events-none')}>
        {/* Square swatch */}
        <div className="w-20 min-h-20 shrink-0 border-r border-line overflow-hidden bg-[repeating-conic-gradient(var(--color-surface)_0%_25%,transparent_0%_50%)] bg-size-[15px_15px]">
          <PreviewCanvas css={layerCss} className="w-full h-full" />
        </div>

        {/* Raw value + sub-props */}
        <div className="flex-1 px-3.5 py-3 min-w-0 flex flex-col gap-2">
          {isEditing ? (
            <textarea
              autoFocus
              className="select-text font-mono text-xs leading-relaxed text-ink w-full bg-transparent outline-none rounded px-1.5 py-1 -mx-1.5 hover:bg-surface focus:bg-surface focus-visible:ring-1 focus-visible:ring-accent/40 transition-colors resize-none break-all max-h-25 overflow-y-auto"
              style={{ fieldSizing: 'content' } as React.CSSProperties}
              value={layer.raw}
              onChange={(e) => onUpdate('raw', e.target.value)}
              onBlur={() => {
                sendGAEvent('event', 'edit_layer')
                setIsEditing(false)
              }}
              spellCheck={false}
              rows={1}
            />
          ) : (
            <RawDisplay
              value={layer.raw}
              onStartEdit={() => setIsEditing(true)}
              onColorPick={handleColorPick}
            />
          )}
          {subProps.length > 0 && (
            <div>
              {subProps.map(({ label, key }) => (
                <div key={label} className="flex gap-2 text-xs items-center">
                  <span className="text-ink-muted shrink-0 w-20">{label}</span>
                  <input
                    className="select-text font-mono text-ink flex-1 min-w-0 bg-transparent outline-none rounded px-1.5 py-1 -mx-1.5 hover:bg-surface focus:bg-surface focus-visible:ring-1 focus-visible:ring-accent/40 transition-colors disabled:pointer-events-none"
                    value={layer[key] as string}
                    onChange={(e) => onUpdate(key, e.target.value)}
                    onBlur={() => sendGAEvent('event', 'edit_layer')}
                    spellCheck={false}
                    disabled={!isVisible}
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
