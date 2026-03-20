'use client'

import { reconstructBackground, type BgLayer } from '@/lib/parseCss'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { CopyButton } from './CopyButton'
import { SquareCode } from 'lucide-react'

const BG_SUBPROPS = [
  'background-size',
  'background-repeat',
  'background-position',
  'background-attachment',
  'background-origin',
  'background-clip',
  'background-blend-mode',
]

export function OutputCss({
  layers,
  originalCss,
}: {
  layers: BgLayer[]
  originalCss: string
}) {
  const block = originalCss.trim().match(/\{([\s\S]*)\}/)
  const inner = block ? block[1] : originalCss

  const customProps = [...inner.matchAll(/(--[\w-]+\s*:[^;]+)/g)]
    .map((m) => `  ${m[1].trim()};`)
    .join('\n')

  const subProps = BG_SUBPROPS.flatMap((prop) => {
    const m = inner.match(new RegExp(`${prop}\\s*:([^;]+)`))
    return m ? [`  ${prop}: ${m[1].trim()};`] : []
  }).join('\n')

  const bgValue = reconstructBackground(layers)
  const outputText = [customProps, `  background:\n    ${bgValue};`, subProps]
    .filter(Boolean)
    .join('\n')

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="text-xs px-3 py-1.5 rounded border border-line bg-canvas hover:bg-surface transition-colors text-ink-muted cursor-pointer font-mono flex items-center gap-2">
          <SquareCode size={14} /> View CSS
        </button>
      </DialogTrigger>
      <DialogContent
        aria-describedby={undefined}
        className="max-w-2xl bg-canvas border-line"
      >
        <DialogHeader>
          <div className="flex items-center justify-between pr-8">
            <DialogTitle className="text-sm font-semibold uppercase tracking-wider text-ink-muted">
              Output CSS
            </DialogTitle>
            <CopyButton text={outputText} />
          </div>
        </DialogHeader>
        <pre className="font-mono text-xs leading-relaxed bg-surface rounded-md p-4 overflow-x-auto border border-line text-ink whitespace-pre-wrap max-h-[60vh] overflow-y-auto">
          {outputText}
        </pre>
      </DialogContent>
    </Dialog>
  )
}
