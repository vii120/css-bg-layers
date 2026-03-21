'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ChevronDown } from 'lucide-react'
import { Reorder, useDragControls } from 'motion/react'
import { cn } from '@/lib/utils'
import { parseCssInput, type BgLayer } from '@/lib/parseCss'
import { useCssStore } from '@/lib/store'
import { PreviewCanvas } from '@/app/_components/PreviewCanvas'
import { LayerCard } from './_components/LayerCard'
import { OutputCss } from './_components/OutputCss'

const BG_SUBPROPS = [
  'background-size',
  'background-repeat',
  'background-position',
  'background-attachment',
  'background-origin',
  'background-clip',
  'background-blend-mode',
]

function buildFilteredPreviewCss(
  originalCss: string,
  layers: BgLayer[],
  hiddenIndices: Set<number>,
): string {
  const block = originalCss.trim().match(/\{([\s\S]*)\}/)
  const inner = block ? block[1] : originalCss

  const customProps = [...inner.matchAll(/(--[\w-]+\s*:[^;]+)/g)]
    .map((m) => m[1].trim())
    .join('; ')

  // Carry over sub-properties like background-size that the shorthand path drops
  const subPropDecls = BG_SUBPROPS.flatMap((prop) => {
    const m = inner.match(new RegExp(`${prop}\\s*:([^;]+)`))
    return m ? [`${prop}: ${m[1].trim()}`] : []
  }).join('; ')

  const visibleLayers = layers.filter((l) => !hiddenIndices.has(l.index))
  if (visibleLayers.length === 0) return ''

  const bgValue = visibleLayers.map((l) => l.raw).join(', ')
  return `div { ${customProps ? `${customProps}; ` : ''}background: ${bgValue}${subPropDecls ? `; ${subPropDecls}` : ''} }`
}

function extractCssVariables(css: string): { name: string; value: string }[] {
  const block = css.trim().match(/\{([\s\S]*)\}/)
  const inner = block ? block[1] : css
  return [...inner.matchAll(/(--[\w-]+)\s*:\s*([^;]+)/g)].map((m) => ({
    name: m[1].trim(),
    value: m[2].trim(),
  }))
}

function DraggableLayerCard({
  layer,
  order,
  total,
  originalCss,
  isVisible,
  onToggleVisibility,
  onUpdate,
}: {
  layer: BgLayer
  order: number
  total: number
  originalCss: string
  isVisible: boolean
  onToggleVisibility: () => void
  onUpdate: (field: keyof BgLayer, value: string) => void
}) {
  const dragControls = useDragControls()
  return (
    <Reorder.Item value={layer} dragListener={false} dragControls={dragControls} className="shrink-0">
      <LayerCard
        layer={layer}
        order={order}
        total={total}
        originalCss={originalCss}
        isVisible={isVisible}
        onToggleVisibility={onToggleVisibility}
        onUpdate={onUpdate}
        dragControls={dragControls}
      />
    </Reorder.Item>
  )
}

export default function EditPage() {
  const { css: stored } = useCssStore()
  const [originalCss, setOriginalCss] = useState('')
  const [layers, setLayers] = useState<BgLayer[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [hiddenLayers, setHiddenLayers] = useState<Set<number>>(new Set())
  const [varsOpen, setVarsOpen] = useState(true)

  useEffect(() => {
    if (!stored) {
      setError('No CSS found. Go back and paste some CSS.')
      return
    }
    setOriginalCss(stored)
    const parsed = parseCssInput(stored)
    if (!parsed || parsed.length === 0) {
      setError(
        'Could not find any background layers. Check that your CSS includes a background property.',
      )
      return
    }
    setLayers(parsed)
  }, [stored])

  function updateLayer(layerIndex: number, field: keyof BgLayer, value: string) {
    setLayers((prev) => prev!.map((l) => l.index === layerIndex ? { ...l, [field]: value } : l))
  }

  function toggleLayer(index: number) {
    setHiddenLayers((prev) => {
      const next = new Set(prev)
      next.has(index) ? next.delete(index) : next.add(index)
      return next
    })
  }

  const visibleLayers = layers?.filter((l) => !hiddenLayers.has(l.index)) ?? []
  const previewCss = layers
    ? buildFilteredPreviewCss(originalCss, layers, hiddenLayers)
    : ''
  const cssVars = extractCssVariables(originalCss)

  return (
    <main className="md:h-[calc(100dvh-3.5rem)] w-full mx-auto px-8 py-10 flex flex-col-reverse md:flex-row gap-8 bg-canvas text-ink">
      {(error || !layers) ? (
        <div className="mx-auto text-sm text-ink-muted py-16 text-center">
          <p>{error}</p>
          <Link
            href="/"
            className="mt-4 inline-block underline underline-offset-2"
          >
            Go back
          </Link>
        </div>
      ) : (
        <>
          {/* Left — Variables + Layer list */}
          <div className="md:w-120 flex flex-col gap-4 min-h-0">
            {/* Layers section */}
            <div className="flex-1 min-h-0 flex flex-col gap-2">
              <h2 className="font-semibold text-sm uppercase tracking-wider text-ink-muted shrink-0">
                <span className="inline-block relative">
                  Layers
                  <span className="absolute bottom-2/5 left-full ml-1 text-xs font-normal scale-90">
                    ({layers.length})
                  </span>
                </span>
              </h2>
              <Reorder.Group
                axis="y"
                values={layers}
                onReorder={setLayers}
                className="flex-1 min-h-0 overflow-auto flex flex-col gap-2"
              >
                {layers.map((layer, i) => (
                  <DraggableLayerCard
                    key={layer.index}
                    layer={layer}
                    order={i}
                    total={layers.length}
                    originalCss={originalCss}
                    isVisible={!hiddenLayers.has(layer.index)}
                    onToggleVisibility={() => toggleLayer(layer.index)}
                    onUpdate={(field, value) => updateLayer(layer.index, field, value)}
                  />
                ))}
              </Reorder.Group>
            </div>

            {/* Variables section */}
            {cssVars.length > 0 && (
              <div className="flex flex-col gap-2 shrink-0">
                <button
                  onClick={() => setVarsOpen((v) => !v)}
                  className="flex items-center gap-1.5 cursor-pointer"
                >
                  <h2 className="font-semibold text-sm uppercase tracking-wider text-ink-muted">
                    <span className="inline-block relative">
                      Variables
                      <span className="absolute bottom-2/5 left-full ml-1 text-xs font-normal scale-90">
                        ({cssVars.length})
                      </span>
                    </span>
                  </h2>
                  <ChevronDown
                    size={12}
                    className={cn(
                      'ml-auto text-ink-muted transition-transform',
                      !varsOpen && '-rotate-90',
                    )}
                  />
                </button>
                {varsOpen && (
                  <div className="max-h-100 overflow-auto flex flex-col gap-1">
                    {cssVars.map((v) => (
                      <div
                        key={v.name}
                        className="shrink-0 flex gap-3 text-xs font-mono px-3 py-1.5 rounded bg-surface border border-line"
                      >
                        <span className="text-ink-muted shrink-0">
                          {v.name}
                        </span>
                        <span className="text-ink truncate">{v.value}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right — Preview */}
          <div className="flex-1 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold uppercase tracking-wider text-ink-muted">
                Preview
              </span>
              <OutputCss layers={visibleLayers} originalCss={originalCss} />
            </div>
            <PreviewCanvas
              css={previewCss}
              className="w-2/3 min-w-100 aspect-square m-auto rounded-md overflow-hidden bg-surface border border-line"
            />
          </div>
        </>
      )}
    </main>
  )
}
