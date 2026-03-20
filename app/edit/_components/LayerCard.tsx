'use client'

import { Eye, EyeClosed } from 'lucide-react'
import { PreviewCanvas } from '@/app/_components/PreviewCanvas'
import type { BgLayer } from '@/lib/parseCss'

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

export function LayerCard({
  layer,
  total,
  originalCss,
  isVisible,
  onToggleVisibility,
}: {
  layer: BgLayer
  total: number
  originalCss: string
  isVisible: boolean
  onToggleVisibility: () => void
}) {
  const layerCss = buildLayerCss(layer, originalCss)

  const displayNumber =
    layer.index === 0
      ? `1 (top)`
      : layer.index === total - 1
        ? `${total} (bottom)`
        : layer.index + 1

  const subProps = [
    layer.position && { label: 'position', value: layer.position },
    layer.size && { label: 'size', value: layer.size },
    layer.repeat && { label: 'repeat', value: layer.repeat },
    layer.attachment && { label: 'attachment', value: layer.attachment },
    layer.origin && { label: 'origin', value: layer.origin },
    layer.clip && { label: 'clip', value: layer.clip },
    layer.blendMode && { label: 'blend-mode', value: layer.blendMode },
    layer.color && { label: 'color', value: layer.color },
  ].filter(Boolean) as { label: string; value: string }[]

  return (
    <div
      className={`rounded-md border border-line overflow-hidden bg-canvas transition-opacity ${isVisible ? '' : 'opacity-40'}`}
    >
      {/* Header row */}
      <div className="px-3.5 py-2 border-b border-line bg-surface flex items-center justify-between">
        <span className="text-xs font-medium text-ink-muted tabular-nums">
          {displayNumber}
        </span>
        <button
          onClick={onToggleVisibility}
          className="text-ink-muted hover:text-ink transition-colors cursor-pointer"
          aria-label={isVisible ? 'Hide layer' : 'Show layer'}
        >
          {isVisible ? <Eye size={14} /> : <EyeClosed size={14} />}
        </button>
      </div>

      {/* Body: square preview + content */}
      <div className="flex">
        {/* Square swatch */}
        <div className="w-20 h-20 shrink-0 border-r border-line overflow-hidden">
          <PreviewCanvas css={layerCss} className="w-full h-full" />
        </div>

        {/* Raw value + sub-props */}
        <div className="flex-1 px-3.5 py-3 min-w-0 flex flex-col gap-2">
          <p className="font-mono text-xs leading-relaxed text-ink break-all">
            {layer.raw}
          </p>
          {subProps.length > 0 && (
            <div className="space-y-1">
              {subProps.map((p) => (
                <div key={p.label} className="flex gap-2 text-xs">
                  <span className="text-ink-muted shrink-0 w-20">
                    {p.label}
                  </span>
                  <span className="font-mono text-ink">{p.value}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
