'use client'

import { useState, useRef, useEffect, useId } from 'react'
import { CssEditor } from './CssEditor'

const EXAMPLES = [
  {
    id: 'cubes',
    label: 'Overlapping cubes',
    css: `div {
  --s: 64px;
  --c1: #fef5e9;
  --c2: #f6e0bc;
  --c3: #f3ca84;

  --_g: 0 120deg, #0000 0;
  background:
    conic-gradient(             at calc(250%/3) calc(100%/3),var(--c3) var(--_g)),
    conic-gradient(from -120deg at calc( 50%/3) calc(100%/3),var(--c2) var(--_g)),
    conic-gradient(from  120deg at calc(100%/3) calc(250%/3),var(--c1) var(--_g)),
    conic-gradient(from  120deg at calc(200%/3) calc(250%/3),var(--c1) var(--_g)),
    conic-gradient(from -180deg at calc(100%/3) 50%,var(--c2)  60deg,var(--c1) var(--_g)),
    conic-gradient(from   60deg at calc(200%/3) 50%,var(--c1)  60deg,var(--c3) var(--_g)),
    conic-gradient(from  -60deg at 50% calc(100%/3),var(--c1) 120deg,var(--c2) 0 240deg,var(--c3) 0);
  background-size: calc(var(--s)*sqrt(3)) var(--s);
}`,
  },
  {
    id: 'arabesque',
    label: 'Arabesque style',
    css: `div {
  --s: 36px;
  --c1: #f3ca84;
  --c2: #fef5e9;

  --t: calc(var(--s)/10);  /* control the thickness */
  --_c: #0000 calc(98% - var(--t)),var(--c1) calc(100% - var(--t)) 98%,#0000;
  --_s: calc(2*var(--s)) calc(5*var(--s)/2);
  --_r0: /var(--_s) radial-gradient(calc(var(--s)/2) at 0    20%,var(--_c));
  --_r1: /var(--_s) radial-gradient(calc(var(--s)/2) at 100% 20%,var(--_c));
  background:
    0 0 var(--_r0),calc(-1*var(--s)) calc(5*var(--s)/4) var(--_r0),
    var(--s) 0 var(--_r1),0 calc(5*var(--s)/4) var(--_r1),
    conic-gradient(at var(--t) calc(20% + 2*var(--t)),#0000 75%,var(--c1) 0)
    calc(var(--t)/-2) calc(var(--s) - var(--t))/var(--s) calc(5*var(--s)/4),
    repeating-conic-gradient(var(--c2) 0 25%,#0000 0 50%)
    var(--s) calc(var(--s)/-8)/var(--_s),
    conic-gradient(from 90deg at var(--t) var(--t),var(--c2) 25%,var(--c1) 0)
    calc((var(--s) - var(--t))/2) calc((var(--s) - var(--t))/2)/var(--s) calc(5*var(--s)/4);
}`,
  },
  {
    id: 'stripes',
    label: 'Rhombus & stripes',
    css: `div {
  --s: 64px;
  --c1: #f3ca84;
  --c2: #fef5e9;

  background:
    conic-gradient(from -45deg,var(--c1) 90deg,#0000 0 180deg,var(--c2) 0 270deg,#0000 0)
      0 calc(var(--s)/2)/var(--s) var(--s),
    conic-gradient(from 135deg at 50% 0,var(--c1) 90deg,var(--c2) 0)
      0 0/calc(2*var(--s)) var(--s);
}`,
  },
]

function extractDeclarations(input: string): string {
  const trimmed = input.trim()
  const braceMatch = trimmed.match(/\{([\s\S]*)\}/)
  if (braceMatch) return braceMatch[1].trim()
  return trimmed
}

function PreviewCanvas({
  css,
  className,
}: {
  css: string
  className?: string
}) {
  const id = useId().replace(/:/g, '')
  const styleRef = useRef<HTMLStyleElement | null>(null)
  const attrVal = useRef(id)

  useEffect(() => {
    if (!styleRef.current) {
      const el = document.createElement('style')
      document.head.appendChild(el)
      styleRef.current = el
    }
    if (!css.trim()) {
      styleRef.current.textContent = ''
      return
    }
    const decl = extractDeclarations(css)
    styleRef.current.textContent = `[data-bg-p="${attrVal.current}"] { ${decl} }`
  }, [css])

  useEffect(
    () => () => {
      styleRef.current?.remove()
      styleRef.current = null
    },
    [],
  )

  return <div data-bg-p={attrVal.current} className={className} />
}

export default function Home() {
  const [css, setCss] = useState('')
  const hasInput = css.trim().length > 0

  return (
    <div className="min-h-screen flex flex-col bg-canvas text-ink">
      {/* Header */}
      <header className="px-8 h-14 flex items-center justify-between shrink-0 border-b border-line">
        <div className="flex items-center gap-2.5">
          <span className="text-xl font-semibold tracking-tight">Layerly</span>
        </div>
      </header>

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
            {EXAMPLES.map((ex) => (
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
