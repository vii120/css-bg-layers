'use client'

import { useState } from 'react'
import { reconstructBackground, type BgLayer } from '@/lib/parseCss'
import { CssViewer } from './CssViewer'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { CopyButton } from './CopyButton'
import { SquareCode } from 'lucide-react'

function minimalCycle(values: string[]): string[] {
  for (let k = 1; k <= Math.floor(values.length / 2); k++) {
    if (values.length % k !== 0) continue
    const unit = values.slice(0, k)
    if (values.every((v, i) => v === unit[i % k])) return unit
  }
  return values
}

function buildOutput(layers: BgLayer[], originalCss: string): string {
  const block = originalCss.trim().match(/\{([\s\S]*)\}/)
  const inner = block ? block[1] : originalCss

  const customProps = [...inner.matchAll(/(--[\w-]+\s*:[^;]+)/g)]
    .map((m) => `  ${m[1].trim()};`)
    .join('\n')

  const bgValue = reconstructBackground(layers)

  // blend-mode can't go in the shorthand — output separately if present
  const blendModes = layers.map((l) => l.blendMode).filter((v): v is string => !!v)
  const blendModeDecl = blendModes.length === layers.length
    ? `  background-blend-mode: ${minimalCycle(blendModes).join(', ')};`
    : ''

  return [customProps, `  background:\n    ${bgValue};`, blendModeDecl]
    .filter(Boolean)
    .join('\n')
}

export function OutputCss({
  layers,
  originalCss,
}: {
  layers: BgLayer[]
  originalCss: string
}) {
  const [outputText, setOutputText] = useState('')

  function handleOpen() {
    setOutputText(buildOutput(layers, originalCss))
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          onClick={handleOpen}
          className="text-xs px-3 py-1.5 rounded border border-line bg-canvas hover:bg-surface transition-colors text-ink-muted cursor-pointer font-mono flex items-center gap-2"
        >
          <SquareCode size={14} /> View CSS
        </button>
      </DialogTrigger>
      <DialogContent
        aria-describedby={undefined}
        className="max-w-2xl bg-canvas border-line"
      >
        <DialogHeader>
          <div className="flex items-center gap-3 pr-10">
            <DialogTitle className="text-sm font-semibold uppercase tracking-wider text-ink-muted">
              Output CSS
            </DialogTitle>
            <CopyButton text={outputText} />
          </div>
        </DialogHeader>
        <CssViewer code={outputText} />
      </DialogContent>
    </Dialog>
  )
}
