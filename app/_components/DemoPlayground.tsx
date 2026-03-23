'use client'

import { memo, useMemo, useState } from 'react'
import { GripVertical } from 'lucide-react'
import { AnimatePresence, Reorder, useDragControls, motion } from 'motion/react'
import { PreviewCanvas } from './PreviewCanvas'

interface DemoLayer {
  id: number
  type: string
  value: string
}

const INITIAL_LAYERS: DemoLayer[] = [
  {
    id: 1,
    type: 'radial',
    value:
      'radial-gradient(circle, #b5bae8 20%, transparent 0) calc(50% - 20.5px) calc(50% - 20.5px) / 40px 40px',
  },
  {
    id: 2,
    type: 'conic',
    value:
      'conic-gradient(from 270deg at bottom 1px right 1px, transparent 25%, #fbfaf9 0) center / 40px 40px',
  },
  {
    id: 3,
    type: 'linear',
    value: 'linear-gradient(-45deg, #dadeff, transparent)',
  },
]

function buildPreviewCss(layers: DemoLayer[]): string {
  return `background: ${layers.map((l) => l.value).join(', ')}`
}

function getGradientFn(value: string): string {
  let depth = 0
  for (let i = 0; i < value.length; i++) {
    if (value[i] === '(') depth++
    else if (value[i] === ')') {
      depth--
      if (depth === 0) return value.slice(0, i + 1)
    }
  }
  return value
}

const whileDrag = {
  scale: 1.015,
  boxShadow: '0 6px 20px rgba(0,0,0,0.08)',
  zIndex: 50,
}

const LayerRow = memo(function LayerRow({
  layer,
  index,
}: {
  layer: DemoLayer
  index: number
}) {
  const dragControls = useDragControls()

  return (
    <Reorder.Item
      value={layer}
      dragListener={false}
      dragControls={dragControls}
      className="flex items-center gap-2.5 rounded border border-line bg-canvas px-3 py-2.5 select-none cursor-default"
      whileDrag={whileDrag}
      initial={{ opacity: 0, x: -6 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{
        delay: index * 0.04,
        duration: 0.2,
        ease: [0.25, 1, 0.5, 1],
      }}
    >
      <span
        className="hit-area-2 shrink-0 touch-none cursor-grab active:cursor-grabbing"
        onPointerDown={(e) => dragControls.start(e)}
      >
        <GripVertical
          size={14}
          className="text-ink-muted/40 hover:text-ink-muted pointer-events-none"
        />
      </span>
      <span className="text-xs tabular-nums text-ink-muted/50 shrink-0 w-3.5 font-mono">
        {index + 1}
      </span>
      <span
        className="w-4 h-4 rounded-sm shrink-0 border border-black/10"
        style={{ backgroundImage: getGradientFn(layer.value) }}
      />
      <span className="font-mono text-[10px] text-ink-muted/50 shrink-0 w-10">
        {layer.type}
      </span>
      <span className="font-mono text-xs text-ink flex-1 min-w-0 truncate">
        {layer.value}
      </span>
    </Reorder.Item>
  )
})

const transition = { duration: 0.25, ease: [0.25, 1, 0.5, 1] as const }
const panelVariants = {
  initial: { opacity: 0, filter: 'blur(5px)' },
  animate: { opacity: 1, filter: 'blur(0px)' },
  exit: { opacity: 0, filter: 'blur(5px)' },
}

export function DemoPlayground() {
  const [mode, setMode] = useState<'raw' | 'layers'>('raw')
  const [layers, setLayers] = useState<DemoLayer[]>(INITIAL_LAYERS)

  const previewCss = useMemo(() => buildPreviewCss(layers), [layers])

  return (
    <div className="flex flex-col gap-4 items-center">
      <div className="font-semibold uppercase tracking-wider text-ink-muted">
        Playground
      </div>
      <button
        onClick={() =>
          setMode((prev) => (prev === 'layers' ? 'raw' : 'layers'))
        }
        className="text-xs px-4 py-2 rounded-full bg-accent/30 font-mono cursor-pointer"
      >
        {mode === 'raw' ? 'Split into layers' : 'View raw CSS'}
      </button>

      <div className="contents md:flex gap-4 items-center justify-center">
        {/* Left panel */}
        <div className="w-full md:w-100">
          <AnimatePresence mode="popLayout" initial={false}>
            {mode === 'raw' ? (
              <motion.div
                key="raw"
                variants={panelVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={transition}
              >
                <div className="font-mono text-xs leading-relaxed text-ink bg-surface rounded-md border border-line p-4 group-hover:border-accent/40 transition-colors break-all">
                  <span className="text-ink-muted">{'background: '}</span>
                  {layers.map((layer, i) => (
                    <span key={layer.id}>
                      <span
                        className="inline-block w-2 h-2 rounded-[2px] mr-1 align-middle -translate-y-px border border-black/10 shrink-0"
                        style={{ backgroundImage: getGradientFn(layer.value) }}
                      />
                      {layer.value}
                      <span className="text-ink-muted">
                        {i < layers.length - 1 ? ', ' : ';'}
                      </span>
                    </span>
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="layers"
                variants={panelVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={transition}
              >
                <Reorder.Group
                  axis="y"
                  values={layers}
                  onReorder={setLayers}
                  className="flex flex-col gap-1.5"
                >
                  {layers.map((layer, i) => (
                    <LayerRow key={layer.id} layer={layer} index={i} />
                  ))}
                </Reorder.Group>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right — preview */}
        <div className="w-50 aspect-4/3 mx-auto rounded-md overflow-hidden border border-line">
          <PreviewCanvas css={previewCss} className="w-full h-full" />
        </div>
      </div>
    </div>
  )
}
