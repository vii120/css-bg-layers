'use client'

import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { motion } from 'motion/react'
import { CssEditor } from './CssEditor'
import { PreviewCanvas } from './_components/PreviewCanvas'
import { EXAMPLES } from '@/lib/examples'
import { useCssStore } from '@/lib/store'
import { parseCssInput } from '@/lib/parseCss'

export default function Home() {
  const { css, setCss } = useCssStore()
  const hasInput = css.trim().length > 0
  const router = useRouter()

  function handleAnalyse() {
    const layers = parseCssInput(css)
    if (!layers) {
      toast.error('No background properties found in the input.')
      return
    }
    router.push('/edit')
  }

  return (
    <div className="min-h-screen flex flex-col bg-canvas text-ink">
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 md:px-8 py-10 md:py-16 space-y-12 md:space-y-16">
        {/* Intro */}
        <motion.div
          className="text-center flex flex-col items-center gap-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.25, 1, 0.5, 1] }}
        >
          <h1 className="text-3xl md:text-5xl font-semibold tracking-tight leading-snug relative font-heading">
            Break down
            <br />
            CSS backgrounds,
            <br />
            <span className="relative z-1 px-2  before:absolute before:inset-0 before:rounded-sm before:bg-linear-[80deg,var(--color-blue-300),var(--color-blue-100)_5%_30%,var(--color-blue-200)_50%_95%,var(--color-blue-400)] before:-skew-1 before:-z-1">
              layer by layer
            </span>
            {/* Deco */}
            <div className="absolute -top-5 right-9/10 w-10 aspect-square bg-conic-[from_270deg_at_bottom_2px_right_2px,transparent_25%,var(--color-amber-400)_0] bg-size-[15px_15px] bg-center -rotate-15 opacity-75 transform-[translateZ(0)]"></div>
            <div className="absolute top-1/3 left-full ml-6 w-10 aspect-square bg-radial-[circle,var(--color-lime-500)_30%,transparent_0] bg-size-[15px_15px] bg-center rotate-15 opacity-75 transform-[translateZ(0)]"></div>
            <div className="absolute bottom-0 right-full w-[45px] aspect-square bg-conic-[var(--color-red-400)_25%,transparent_25%_50%,var(--color-red-400)_50%_75%,transparent_75%] bg-size-[30px_30px] -rotate-20 opacity-75 transform-[translateZ(0)]"></div>
          </h1>
          <p className="text-lg leading-relaxed text-ink-muted">
            Dive into each layer and see how it fits together.
          </p>
        </motion.div>

        {/* Editor */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1, ease: [0.25, 1, 0.5, 1] }}
        >
          <div className="grid md:grid-cols-2 gap-5 mb-4">
            {/* Input */}
            <div className="flex flex-col gap-2">
              <span className="font-semibold uppercase tracking-wider text-ink-muted">
                CSS input
              </span>
              <CssEditor
                value={css}
                onChange={setCss}
                placeholder={`background: linear-gradient(...),\n  radial-gradient(...);\nbackground-size: 100px 100px;`}
                className="h-64 rounded-md overflow-hidden bg-surface border border-line text-ink"
              />
            </div>

            {/* Preview */}
            <div className="flex flex-col gap-2">
              <span className="font-semibold uppercase tracking-wider text-ink-muted">
                Preview
              </span>
              <div className="h-64 rounded-md overflow-hidden relative border border-line">
                {hasInput ? (
                  <PreviewCanvas
                    css={css}
                    className="absolute inset-0 w-full h-full"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-sm select-none text-ink-muted/60 bg-[repeating-conic-gradient(var(--color-surface)_0%_25%,transparent_0%_50%)] bg-size-[20px_20px]">
                    <span className="bg-canvas/80 backdrop-blur-sm px-2.5 py-1 rounded text-xs text-ink-muted">
                      paste CSS to preview
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <button
            disabled={!hasInput}
            onClick={handleAnalyse}
            className="group block mx-auto md:mx-0 px-5 py-2.5 rounded-full text-sm font-medium transition-all border bg-surface text-ink-muted border-line cursor-not-allowed enabled:bg-indigo-400 enabled:text-white enabled:border-transparent enabled:cursor-pointer enabled:active:scale-[0.97]"
          >
            Analyse layers{' '}
            <span className="inline-block transition-transform group-enabled:group-hover:translate-x-0.5">
              →
            </span>
          </button>
        </motion.div>

        {/* Examples */}
        <motion.section
          id="examples"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2, ease: [0.25, 1, 0.5, 1] }}
        >
          <p className="font-semibold uppercase tracking-wider text-ink-muted mb-5">
            Try an example
          </p>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {EXAMPLES.map((ex) => {
              const layerCount = parseCssInput(ex.css)?.length ?? 0
              return (
                <button
                  key={ex.id}
                  onClick={() => setCss(ex.css)}
                  className="text-left overflow-hidden transition-colors group border border-line rounded-md cursor-pointer"
                >
                  <div className="w-full aspect-video relative overflow-hidden">
                    <PreviewCanvas
                      css={ex.css}
                      className="absolute inset-0 w-full h-full transition-transform duration-300 group-hover:scale-103"
                    />
                    <span className="absolute top-2 right-2 text-xs font-mono px-1.5 py-0.5 rounded bg-black/30 text-white/80 backdrop-blur-sm tabular-nums">
                      {layerCount} layers
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
                      onClick={(e) => e.stopPropagation()}
                      className="text-xs text-ink-muted underline underline-offset-2 hover:text-ink transition-colors"
                    >
                      via {ex.source.name}
                    </a>
                  </div>
                </button>
              )
            })}
          </div>
        </motion.section>
      </main>

      <footer className="max-w-5xl w-full mx-auto px-4 md:px-8 py-6 mt-auto border-t border-line text-ink-muted flex items-center justify-end text-sm">
        <div className="flex items-center gap-4">
          <a
            href="https://github.com/vii120/css-bg-layers"
            target="_blank"
            className="underline underline-offset-2 hover:text-ink transition-colors"
          >
            GitHub
          </a>
          <span>
            Created by{' '}
            <a
              href="https://www.vivitseng.com/"
              target="_blank"
              className="underline underline-offset-2 hover:text-ink transition-colors"
            >
              Vivi Tseng
            </a>
          </span>
        </div>
      </footer>
    </div>
  )
}
