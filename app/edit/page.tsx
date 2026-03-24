'use client'

import type { BgLayer } from '@/lib/parseCss'
import { sendGAEvent } from '@next/third-parties/google'
import { Eye, EyeClosed, MoveLeft } from 'lucide-react'
import { motion, Reorder, useDragControls } from 'motion/react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { PreviewCanvas } from '@/app/_components/PreviewCanvas'
import { parseCssInput, reconstructBackground } from '@/lib/parseCss'
import { useCssStore } from '@/lib/store'
import { cn } from '@/lib/utils'
import {
  AspectRatioPicker,
  ASPECT_RATIOS,
} from './_components/AspectRatioPicker'
import type { AspectRatio } from './_components/AspectRatioPicker'
import { BackgroundColorCard } from './_components/BackgroundColorCard'
import { LayerCard } from './_components/LayerCard'
import { OutputCss } from './_components/OutputCss'
import { VariablesPanel } from './_components/VariablesPanel'

function buildFilteredPreviewCss(
  cssVars: { name: string; value: string }[],
  layers: BgLayer[],
  hiddenIndices: Set<number>,
  hideColor: boolean,
): string {
  const customProps = cssVars.map((v) => `${v.name}: ${v.value}`).join('; ')

  const visibleLayers = layers.filter((l) => !hiddenIndices.has(l.index))
  const color = !hideColor
    ? layers.reduce<string | undefined>((acc, l) => l.color ?? acc, undefined)
    : undefined

  if (visibleLayers.length === 0 && !color) return ''

  const decls: string[] = []

  if (visibleLayers.length > 0) {
    decls.push(`background: ${reconstructBackground(visibleLayers)}`)
  } else {
    // No image layers — reset background so a previous render doesn't bleed through
    decls.push('background: none')
  }

  if (color) decls.push(`background-color: ${color}`)

  const blendModes = visibleLayers.map((l) => l.blendMode).filter(Boolean)
  if (blendModes.length > 0)
    decls.push(`background-blend-mode: ${blendModes.join(', ')}`)

  const customPropsStr = customProps ? `${customProps}; ` : ''
  return `div { ${customPropsStr}${decls.join('; ')} }`
}

function extractCssVariables(css: string): { name: string; value: string }[] {
  const block = css.trim().match(/\{([\s\S]*)\}/)
  const inner = block ? block[1] : css
  return Array.from(inner.matchAll(/(--[\w-]+)\s*:\s*([^;]+)/g), (m) => ({
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

export default function EditPage() {
  const { css: stored } = useCssStore()
  const router = useRouter()
  const [layers, setLayers] = useState<BgLayer[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [hiddenLayers, setHiddenLayers] = useState<Set<number>>(new Set())
  const [cssVars, setCssVars] = useState<{ name: string; value: string }[]>([])
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>(ASPECT_RATIOS[0])
  const [colorHidden, setColorHidden] = useState(false)

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
    ? buildFilteredPreviewCss(cssVars, layers, hiddenLayers, colorHidden)
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
                  onClick={() => {
                    sendGAEvent('event', 'toggle_all_layers', {
                      name: hiddenLayers.size > 0 ? 'show' : 'hide',
                    })
                    if (hiddenLayers.size > 0 || colorHidden) {
                      setHiddenLayers(new Set())
                      setColorHidden(false)
                    } else {
                      setHiddenLayers(new Set(layers.map((l) => l.index)))
                      setColorHidden(true)
                    }
                  }}
                  className="mr-3 flex items-center gap-1 text-xs text-ink-muted hover:text-ink transition-colors cursor-pointer hit-area-2"
                  title={
                    hiddenLayers.size > 0 || colorHidden
                      ? 'Show all'
                      : 'Hide all'
                  }
                >
                  {hiddenLayers.size > 0 || colorHidden ? (
                    <>
                      <Eye size={14} /> show all
                    </>
                  ) : (
                    <>
                      <EyeClosed size={14} /> hide all
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
                {/* Background color — always pinned to last layer */}
                {(() => {
                  const layerWithColor = layers.find((l) => l.color != null)
                  if (!layerWithColor) return null
                  return (
                    <BackgroundColorCard
                      layer={layerWithColor}
                      colorHidden={colorHidden}
                      onToggleVisibility={() => setColorHidden((v) => !v)}
                      onUpdate={(field, value) =>
                        updateLayer(layerWithColor.index, field, value)
                      }
                    />
                  )
                })()}
              </Reorder.Group>
            </div>

            {/* Variables section */}
            {cssVars.length > 0 && (
              <VariablesPanel cssVars={cssVars} onUpdate={updateVar} />
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
                    sendGAEvent('event', 'click_new_analysis')
                    router.push('/')
                  }}
                  className="text-xs px-3 py-1.5 rounded border border-line bg-canvas hover:bg-surface transition-colors text-ink-muted cursor-pointer font-mono flex items-center gap-1.5"
                >
                  <MoveLeft size={14} />
                  New analysis
                </button>
                <OutputCss
                  layers={visibleLayers}
                  cssVars={cssVars}
                  hideColor={colorHidden}
                />
              </div>
            </div>
            <div className="md:flex-1 h-75 md:h-auto flex items-center justify-center overflow-hidden">
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
            <AspectRatioPicker
              current={aspectRatio}
              onChange={setAspectRatio}
            />
          </div>
        </>
      )}
    </main>
  )
}
