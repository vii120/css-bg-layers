'use client'

import type { AspectRatio } from './_components/AspectRatioPicker'
import type { Plane } from './_components/LayerStack'
import type { BgLayer } from '@/lib/parseCss'
import { sendGAEvent } from '@next/third-parties/google'
import { Eye, EyeClosed, Layers2, MoveLeft } from 'lucide-react'
import { motion, Reorder, useDragControls } from 'motion/react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { parseCssInput, reconstructBackground } from '@/lib/parseCss'
import { useCssStore } from '@/lib/store'
import { cn } from '@/lib/utils'
import {
  ASPECT_RATIOS,
  AspectRatioPicker,
} from './_components/AspectRatioPicker'
import { BackgroundColorCard } from './_components/BackgroundColorCard'
import { LayerCard } from './_components/LayerCard'
import { CURVE_BACK, CURVE_OUT, LayerStack, stackOverflow } from './_components/LayerStack'
import { OutputCss } from './_components/OutputCss'
import { VariablesPanel } from './_components/VariablesPanel'

function planeCss(cssVars: { name: string; value: string }[], decls: string) {
  const customProps = cssVars.map((v) => `${v.name}: ${v.value}; `).join('')
  return `div { ${customProps}${decls} }`
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
  isActive,
  onToggleVisibility,
  onUpdate,
}: {
  layer: BgLayer
  order: number
  total: number
  cssVars: { name: string; value: string }[]
  isVisible: boolean
  isActive: boolean
  onToggleVisibility: () => void
  onUpdate: (field: keyof BgLayer, value: string) => void
}) {
  const dragControls = useDragControls()
  return (
    <Reorder.Item
      value={layer}
      dragListener={false}
      dragControls={dragControls}
      data-layer-key={layer.index}
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
        isActive={isActive}
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
  const [is3d, setIs3d] = useState(false)
  const [selectedKey, setSelectedKey] = useState<string | number | null>(null)
  const listRef = useRef<HTMLUListElement>(null)

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
  // One plane per visible layer (top first), plus the background color at the bottom
  const color = colorHidden
    ? undefined
    : layers?.reduce<string | undefined>((acc, l) => l.color ?? acc, undefined)
  // Like real CSS, background-color is clipped by the bottom layer's background-clip
  const bottomClip = visibleLayers.at(-1)?.clip
  const planes: Plane[] = [
    ...visibleLayers.map((l) => ({
      key: l.index,
      label: `layer ${layers!.indexOf(l) + 1}`,
      css: planeCss(cssVars, `background: ${reconstructBackground([l])}`),
      blend: l.blendMode,
    })),
    ...(color
      ? [{
          key: 'color',
          label: 'background color',
          css: planeCss(cssVars, `background-color: ${color}${bottomClip ? `; background-clip: ${bottomClip}` : ''}`),
        }]
      : []),
  ]
  // Selected plane in 3D; falls back to the top one (e.g. if it gets hidden)
  const activeKey = planes.some((p) => p.key === selectedKey)
    ? selectedKey!
    : planes[0]?.key

  function selectLayer(key: string | number) {
    setSelectedKey(key)
    const list = listRef.current
    const card = list?.querySelector(`[data-layer-key="${key}"]`)
    if (!list || !card) return
    // ponytail: manual "nearest" so only the layer list scrolls; scrollIntoView would also scroll the page
    const l = list.getBoundingClientRect()
    const c = card.getBoundingClientRect()
    const delta = c.top < l.top ? c.top - l.top : c.bottom > l.bottom ? c.bottom - l.bottom : 0
    if (!delta) return
    list.scrollTo({
      top: list.scrollTop + delta,
      behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
    })
  }

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
                ref={listRef}
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
                    isActive={is3d && activeKey === layer.index}
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
                      isActive={is3d && activeKey === 'color'}
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
                  className="text-xs px-3 py-1.5 rounded border border-line bg-canvas hover:bg-surface transition-colors text-ink-muted cursor-pointer flex items-center gap-1.5"
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
            {/* center-safe: when the 3D stack overflows, scroll reaches its top too */}
            <div className="md:flex-1 h-75 md:h-auto min-h-0 flex items-center-safe justify-center-safe overflow-auto">
              <motion.div
                layout
                style={{
                  aspectRatio: aspectRatio.ratio,
                  // Transforms don't take up layout space, so reserve room for the spread stack
                  marginBlock: is3d ? stackOverflow(planes.length) / 2 : 0,
                  transition: `aspect-ratio 0.3s ease, margin 0.7s ${is3d ? CURVE_OUT : CURVE_BACK}`,
                }}
                className={cn(
                  'relative',
                  aspectRatio.label === '9:16'
                    ? 'h-full'
                    : 'w-full max-w-72 md:max-w-150',
                )}
              >
                <LayerStack
                  planes={planes}
                  is3d={is3d}
                  active={activeKey}
                  onSelect={selectLayer}
                />
              </motion.div>
            </div>
            <div className="flex justify-center items-center gap-1">
              <AspectRatioPicker
                current={aspectRatio}
                onChange={setAspectRatio}
              />
              <span className="w-px h-4 mx-1 bg-line" />
              <button
                onClick={() => {
                  sendGAEvent('event', 'toggle_3d', {
                    name: is3d ? 'off' : 'on',
                  })
                  setIs3d((v) => !v)
                }}
                aria-pressed={is3d}
                title="Explode layers in 3D"
                className={cn(
                  'px-2.5 py-1 rounded text-xs transition-colors cursor-pointer flex items-center gap-1',
                  is3d
                    ? 'bg-accent text-white'
                    : 'text-ink-muted hover:text-ink hover:bg-surface',
                )}
              >
                <Layers2 size={12} />
                3D
              </button>
            </div>
          </div>
        </>
      )}
    </main>
  )
}
