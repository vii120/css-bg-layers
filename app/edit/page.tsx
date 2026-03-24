'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ChevronDown, Eye, EyeOff, MoveLeft } from 'lucide-react'
import { motion, AnimatePresence, Reorder, useDragControls } from 'motion/react'
import { cn } from '@/lib/utils'
import {
  parseCssInput,
  reconstructBackground,
  type BgLayer,
} from '@/lib/parseCss'
import { useCssStore } from '@/lib/store'
import { PreviewCanvas } from '@/app/_components/PreviewCanvas'
import { LayerCard } from './_components/LayerCard'
import { OutputCss } from './_components/OutputCss'

function buildFilteredPreviewCss(
  cssVars: { name: string; value: string }[],
  layers: BgLayer[],
  hiddenIndices: Set<number>,
): string {
  const customProps = cssVars.map((v) => `${v.name}: ${v.value}`).join('; ')

  const visibleLayers = layers.filter((l) => !hiddenIndices.has(l.index))
  if (visibleLayers.length === 0) return ''

  const bgValue = reconstructBackground(visibleLayers)

  const blendModes = visibleLayers.map((l) => l.blendMode).filter(Boolean)
  const blendModeDecl =
    blendModes.length > 0
      ? `; background-blend-mode: ${blendModes.join(', ')}`
      : ''

  return `div { ${customProps ? `${customProps}; ` : ''}background: ${bgValue}${blendModeDecl} }`
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
  cssVars,
  isVisible,
  onToggleVisibility,
  onUpdate,
}: {
  layer: BgLayer
  order: number
  total: number
  cssVars: { name: string; value: string }[]
  isVisible: boolean
  onToggleVisibility: () => void
  onUpdate: (field: keyof BgLayer, value: string) => void
}) {
  const dragControls = useDragControls()
  return (
    <Reorder.Item
      value={layer}
      dragListener={false}
      dragControls={dragControls}
      className="shrink-0"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: order * 0.05,
        duration: 0.2,
        ease: [0.25, 1, 0.5, 1],
      }}
      whileDrag={{
        scale: 1.015,
        zIndex: 50,
      }}
    >
      <LayerCard
        layer={layer}
        order={order}
        total={total}
        cssVars={cssVars}
        isVisible={isVisible}
        onToggleVisibility={onToggleVisibility}
        onUpdate={onUpdate}
        dragControls={dragControls}
      />
    </Reorder.Item>
  )
}

const ASPECT_RATIOS = [
  { label: '16:9', ratio: '16 / 9' },
  { label: '4:3', ratio: '4 / 3' },
  { label: '1:1', ratio: '1 / 1' },
  { label: '9:16', ratio: '9 / 16' },
] as const

export default function EditPage() {
  const { css: stored, setCss } = useCssStore()
  const router = useRouter()
  const [layers, setLayers] = useState<BgLayer[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [hiddenLayers, setHiddenLayers] = useState<Set<number>>(new Set())
  const [varsOpen, setVarsOpen] = useState(true)
  const [cssVars, setCssVars] = useState<{ name: string; value: string }[]>([])
  const [aspectRatio, setAspectRatio] = useState<
    (typeof ASPECT_RATIOS)[number]
  >(ASPECT_RATIOS[0])

  useEffect(() => {
    if (!stored) {
      setError('No CSS found. Go back and paste some CSS.')
      return
    }
    const parsed = parseCssInput(stored)
    if (!parsed || parsed.length === 0) {
      setError(
        'Could not find any background layers. Check that your CSS includes a background property.',
      )
      return
    }
    setLayers(parsed)
    setCssVars(extractCssVariables(stored))
  }, [stored])

  function updateVar(name: string, newValue: string) {
    setCssVars((prev) =>
      prev.map((v) => (v.name === name ? { ...v, value: newValue } : v)),
    )
  }

  function updateLayer(
    layerIndex: number,
    field: keyof BgLayer,
    value: string,
  ) {
    setLayers((prev) =>
      prev!.map((l) => (l.index === layerIndex ? { ...l, [field]: value } : l)),
    )
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
    ? buildFilteredPreviewCss(cssVars, layers, hiddenLayers)
    : ''

  return (
    <main className="md:h-[calc(100dvh-4rem)] w-full mx-auto px-4 md:px-8 py-6 md:py-10 flex flex-col-reverse md:flex-row gap-6 md:gap-8 bg-canvas text-ink">
      {error || !layers ? (
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
            <div className="flex-1 min-h-0 flex flex-col gap-3">
              <div className="flex items-center justify-between shrink-0 pl-3 border-l-3 border-accent py-0.5">
                <h2 className="font-semibold text-sm uppercase tracking-wider text-ink flex items-center gap-2">
                  Layers
                  <span className="text-xs font-normal normal-case tracking-normal px-1.5 py-0.5 rounded bg-surface text-ink-muted">
                    {layers.length}
                  </span>
                </h2>
                <button
                  onClick={() =>
                    hiddenLayers.size > 0
                      ? setHiddenLayers(new Set())
                      : setHiddenLayers(new Set(layers.map((l) => l.index)))
                  }
                  className="mr-3 flex items-center gap-1 text-xs text-ink-muted hover:text-ink transition-colors cursor-pointer hit-area-2"
                  title={hiddenLayers.size > 0 ? 'Show all' : 'Hide all'}
                >
                  {hiddenLayers.size > 0 ? (
                    <>
                      <Eye size={14} /> show all
                    </>
                  ) : (
                    <>
                      <EyeOff size={14} /> hide all
                    </>
                  )}
                </button>
              </div>
              <Reorder.Group
                axis="y"
                values={layers}
                onReorder={setLayers}
                className="flex-1 min-h-0 overflow-auto flex flex-col gap-2 -m-1 p-1"
              >
                {layers.map((layer, i) => (
                  <DraggableLayerCard
                    key={layer.index}
                    layer={layer}
                    order={i}
                    total={layers.length}
                    cssVars={cssVars}
                    isVisible={!hiddenLayers.has(layer.index)}
                    onToggleVisibility={() => toggleLayer(layer.index)}
                    onUpdate={(field, value) =>
                      updateLayer(layer.index, field, value)
                    }
                  />
                ))}
              </Reorder.Group>
            </div>

            {/* Variables section */}
            {cssVars.length > 0 && (
              <div className="max-h-50 flex flex-col gap-3 shrink-0">
                <button
                  onClick={() => setVarsOpen((v) => !v)}
                  className="flex items-center gap-1.5 cursor-pointer pl-3 border-l-3 border-accent py-0.5"
                >
                  <h2 className="font-semibold text-sm uppercase tracking-wider text-ink flex items-center gap-2">
                    Variables
                    <span className="text-xs font-normal normal-case tracking-normal px-1.5 py-0.5 rounded bg-surface text-ink-muted">
                      {cssVars.length}
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
                <AnimatePresence initial={false}>
                  {varsOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2, ease: [0.25, 1, 0.5, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="max-h-50 overflow-auto flex flex-col gap-1">
                        {cssVars.map((v) => (
                          <div
                            key={v.name}
                            className="shrink-0 flex gap-3 text-xs font-mono px-3 py-1.5 rounded bg-surface border border-line"
                          >
                            <span className="text-ink-muted shrink-0">
                              {v.name}
                            </span>
                            <input
                              className="select-text text-ink flex-1 min-w-0 bg-transparent outline-none rounded px-1.5 py-0.5 -mx-1.5 hover:bg-canvas focus:bg-canvas transition-colors"
                              value={v.value}
                              onChange={(e) =>
                                updateVar(v.name, e.target.value)
                              }
                              spellCheck={false}
                            />
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Right — Preview */}
          <div className="flex-1 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold uppercase tracking-wider text-ink-muted">
                Preview
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setCss('')
                    router.push('/')
                  }}
                  className="text-xs px-3 py-1.5 rounded border border-line bg-canvas hover:bg-surface transition-colors text-ink-muted cursor-pointer font-mono flex items-center gap-1.5"
                >
                  <MoveLeft size={14} />
                  New analysis
                </button>
                <OutputCss layers={visibleLayers} cssVars={cssVars} />
              </div>
            </div>
            <div className="md:flex-1 h-75 md:h-auto flex items-center justify-center">
              <motion.div
                layout
                style={{
                  aspectRatio: aspectRatio.ratio,
                  transition: 'aspect-ratio 0.3s ease',
                }}
                className={cn(
                  'rounded-md overflow-hidden bg-surface border border-line',
                  aspectRatio.label === '9:16'
                    ? 'h-full'
                    : 'w-full max-w-72 md:max-w-150',
                )}
              >
                <PreviewCanvas css={previewCss} className="w-full h-full" />
              </motion.div>
            </div>
            <div className="flex justify-center items-center gap-1 shrink-0">
              {ASPECT_RATIOS.map((r) => (
                <button
                  key={r.label}
                  onClick={() => setAspectRatio(r)}
                  className={cn(
                    'px-2.5 py-1 rounded text-xs font-mono transition-colors cursor-pointer',
                    r.label === aspectRatio.label
                      ? 'bg-accent text-white'
                      : 'text-ink-muted hover:text-ink hover:bg-surface',
                  )}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </main>
  )
}
