'use client'

import { useRouter } from 'next/navigation'
import { CssEditor } from './CssEditor'
import { PreviewCanvas } from './_components/PreviewCanvas'
import { EXAMPLES } from '@/lib/examples'
import { useCssStore } from '@/lib/store'

export default function Home() {
  const { css, setCss } = useCssStore()
  const hasInput = css.trim().length > 0
  const router = useRouter()

  function handleAnalyse() {
    router.push('/edit')
  }

  return (
    <div className="min-h-screen flex flex-col bg-canvas text-ink">
      <main className="flex-1 max-w-5xl w-full mx-auto px-8 py-16 space-y-16">
        {/* Intro */}
        <div className="text-center">
          <h1 className="text-[2.5rem] font-semibold tracking-tight leading-snug mb-4">
            Layer by layer,
            <br />
            mystery solved.
          </h1>
          <p className="text-lg leading-relaxed text-ink-muted">
            Split, visualize, and edit every CSS background layer with ease.
          </p>
        </div>

        {/* Editor */}
        <div>
          <div className="grid grid-cols-2 gap-5 mb-4">
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
                  <div className="absolute inset-0 flex items-center justify-center text-sm select-none text-ink-muted">
                    Preview appears here
                  </div>
                )}
              </div>
            </div>
          </div>

          <button
            disabled={!hasInput}
            onClick={handleAnalyse}
            className="px-5 py-2.5 rounded-md text-sm font-medium transition-colors border bg-surface text-ink-muted border-line cursor-not-allowed enabled:bg-accent enabled:text-white enabled:border-transparent enabled:cursor-pointer"
          >
            Analyse layers →
          </button>
        </div>

        {/* Examples */}
        <section id="examples">
          <p className="font-semibold uppercase tracking-wider text-ink-muted mb-5">
            Try an example
          </p>
          <div className="grid grid-cols-3 gap-4">
            {EXAMPLES.map((ex) => (
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
                </div>
                <div className="px-3.5 py-3 transition-colors border-t border-line bg-canvas">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="text-sm font-medium">{ex.label}</p>
                    {ex.note && (
                      <span className="text-[10px] text-ink-muted shrink-0">
                        {ex.note}
                      </span>
                    )}
                  </div>
                  <a
                    href={ex.source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-[10px] text-ink-muted underline underline-offset-2 hover:text-ink transition-colors"
                  >
                    via {ex.source.name}
                  </a>
                </div>
              </button>
            ))}
          </div>
        </section>
      </main>

      <footer className="max-w-5xl w-full mx-auto px-8 py-6 mt-auto border-t border-line text-ink-muted">
        <p className="text-xs">bg.layers</p>
      </footer>
    </div>
  )
}
