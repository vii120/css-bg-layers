'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CssEditor } from './CssEditor'
import { PreviewCanvas } from './_components/PreviewCanvas'
import { EXAMPLES } from '@/lib/examples'

export default function Home() {
  const [css, setCss] = useState('')
  const hasInput = css.trim().length > 0
  const router = useRouter()

  function handleAnalyse() {
    sessionStorage.setItem('layerly-css', css)
    router.push('/edit')
  }

  return (
    <div className="min-h-screen flex flex-col bg-canvas text-ink">
      <main className="flex-1 max-w-5xl w-full mx-auto px-8 py-16 space-y-16">
        {/* Intro */}
        <div>
          <h1 className="text-[2.5rem] font-semibold tracking-tight leading-[1.1] mb-4">
            Layer by layer,
            <br />
            mystery solved.
          </h1>
          <p className="text-lg leading-relaxed text-ink-muted">
            Break your CSS backgrounds into clear, editable layers.
            <br />
            No more guessing — just see and change every detail.
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
                {hasInput
                  ? (
                      <PreviewCanvas css={css} className="absolute inset-0 w-full h-full" />
                    )
                  : (
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
          <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 mb-5">
            <p className="font-semibold uppercase tracking-wider text-ink-muted">
              Start with an example
            </p>
            <p className="text-xs text-ink-muted">
              Patterns from{' '}
              <a
                href="https://css-pattern.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2"
              >
                css-pattern.com
              </a>{' '}
              by Temani Afif
            </p>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {EXAMPLES.map(ex => (
              <button
                key={ex.id}
                onClick={() => setCss(ex.css)}
                className="text-left overflow-hidden transition-colors group border border-line rounded-md cursor-pointer"
              >
                <div className="w-full aspect-video relative overflow-hidden">
                  <PreviewCanvas
                    css={ex.css}
                    className="absolute inset-0 w-full h-full transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="px-3.5 py-3 transition-colors border-t border-line bg-canvas">
                  <p className="text-sm font-medium">{ex.label}</p>
                </div>
              </button>
            ))}
          </div>
        </section>
      </main>

      <footer className="max-w-5xl w-full mx-auto px-8 py-6 mt-auto border-t border-line text-ink-muted">
        <p className="text-xs">Layerly</p>
      </footer>
    </div>
  )
}
