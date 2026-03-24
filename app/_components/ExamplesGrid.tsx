'use client'

import { sendGAEvent } from '@next/third-parties/google'
import { motion } from 'motion/react'
import { useRouter } from 'next/navigation'
import { EXAMPLES } from '@/lib/examples'
import { parseCssInput } from '@/lib/parseCss'
import { useCssStore } from '@/lib/store'
import { PreviewCanvas } from './PreviewCanvas'

export function ExamplesGrid() {
  const { setCss } = useCssStore()
  const router = useRouter()

  return (
    <motion.section
      id="examples"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2, ease: [0.25, 1, 0.5, 1] }}
    >
      <p className="text-sm font-semibold uppercase tracking-wider text-ink-muted mb-5">
        Try an example
      </p>
      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
        {EXAMPLES.map((ex) => {
          const layerCount = parseCssInput(ex.css)?.length ?? 0
          return (
            <button
              key={ex.id}
              onClick={() => {
                setCss(ex.css)
                sendGAEvent('event', 'click_example', { name: ex.label })
                router.push('/edit')
              }}
              className="text-left overflow-hidden transition-colors group border border-line rounded-md cursor-pointer"
            >
              <div className="w-full aspect-video relative overflow-hidden">
                <PreviewCanvas
                  css={ex.css}
                  className="absolute inset-0 w-full h-full transition-transform duration-300 group-hover:scale-103"
                />
                <span className="absolute top-2 right-2 text-xs font-mono px-1.5 py-0.5 rounded bg-black/30 text-white/80 backdrop-blur-sm tabular-nums">
                  {layerCount}
                  {' '}
                  layers
                </span>
              </div>
              <div className="px-3.5 py-3 transition-colors border-t border-line bg-canvas">
                <div className="flex items-baseline justify-between gap-2">
                  <p className="text-sm font-medium">{ex.label}</p>
                  {ex.note && (
                    <span className="text-xs text-ink-muted shrink-0">
                      {ex.note}
                    </span>
                  )}
                </div>
                <a
                  href={ex.source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={e => e.stopPropagation()}
                  className="text-xs text-ink-muted underline underline-offset-2 hover:text-ink transition-colors"
                >
                  via
                  {' '}
                  {ex.source.name}
                </a>
              </div>
            </button>
          )
        })}
      </div>
    </motion.section>
  )
}
