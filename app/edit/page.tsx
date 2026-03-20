'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { parseCssInput, type BgLayer } from '@/lib/parseCss'
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

export default function EditPage() {
  const [originalCss, setOriginalCss] = useState('')
  const [layers, setLayers] = useState<BgLayer[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [hiddenLayers, setHiddenLayers] = useState<Set<number>>(new Set())

  useEffect(() => {
    const stored = sessionStorage.getItem('layerly-css')
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
  }, [])

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

  return (
    <div className="min-h-screen flex flex-col bg-canvas text-ink">
      <main className="flex-1 max-w-6xl w-full mx-auto px-8 py-10">
        {error && (
          <div className="text-sm text-ink-muted py-16 text-center">
            <p>{error}</p>
            <Link
              href="/"
              className="mt-4 inline-block text-accent underline underline-offset-2"
            >
              Go back
            </Link>
          </div>
        )}

        {layers && (
          <div className="grid grid-cols-[1fr_1.5fr] gap-8 items-start">
            {/* Left — Layer list */}
            <div className="flex flex-col gap-4">
              <h2 className="font-semibold text-sm uppercase tracking-wider text-ink-muted">
                Layers ({layers.length})
              </h2>
              <div className="flex flex-col gap-2">
                {layers.map((layer) => (
                  <LayerCard
                    key={layer.index}
                    layer={layer}
                    total={layers.length}
                    originalCss={originalCss}
                    isVisible={!hiddenLayers.has(layer.index)}
                    onToggleVisibility={() => toggleLayer(layer.index)}
                  />
                ))}
              </div>
            </div>

            {/* Right — Preview */}
            <div className="flex flex-col gap-4 sticky top-8">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold uppercase tracking-wider text-ink-muted">
                  Preview
                </span>
                <OutputCss layers={visibleLayers} originalCss={originalCss} />
              </div>
              <div className="w-full aspect-video rounded-md overflow-hidden border border-line relative bg-surface">
                <PreviewCanvas
                  css={previewCss}
                  className="absolute inset-0 w-full h-full"
                />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
