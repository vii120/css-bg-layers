'use client'

import type { RefObject } from 'react'
import type { CssEditorHandle } from '../CssEditor'
import { sendGAEvent } from '@next/third-parties/google'
import { Layers } from 'lucide-react'
import { motion } from 'motion/react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { parseCssInput } from '@/lib/parseCss'
import { useCssStore } from '@/lib/store'
import { CssEditor } from '../CssEditor'
import { PreviewCanvas } from './PreviewCanvas'

export function CssInputSection({
  editorRef,
}: {
  editorRef: RefObject<CssEditorHandle | null>
}) {
  const { css, setCss } = useCssStore()
  const hasInput = css.trim().length > 0
  const router = useRouter()

  function handleAnalyse() {
    const layers = parseCssInput(css)
    if (!layers) {
      toast.error('No background properties found in the input.')
      sendGAEvent('event', 'click_analysis', { name: 'failed' })
      return
    }
    sendGAEvent('event', 'click_analysis', { name: 'success' })
    router.push('/edit')
  }

  return (
    <motion.div
      id="css-input"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2, ease: [0.25, 1, 0.5, 1] }}
    >
      <div className="grid md:grid-cols-2 gap-5 mb-4">
        {/* Input */}
        <div className="flex flex-col gap-2">
          <div className="flex items-baseline justify-between">
            <span className="text-sm font-semibold uppercase tracking-wider text-ink-muted">
              CSS input
            </span>
            <button
              onClick={() => {
                sendGAEvent('event', 'click_try_example')
                document
                  .getElementById('examples')
                  ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
              }}
              className="text-xs text-ink-muted/50 hover:text-ink-muted transition-colors cursor-pointer hit-area-2"
            >
              or try an example ↓
            </button>
          </div>
          <CssEditor
            ref={editorRef}
            value={css}
            onChange={setCss}
            placeholder={`background: linear-gradient(...),\n  radial-gradient(...);\nbackground-size: 100px 100px;`}
            className="h-64 rounded-md overflow-hidden bg-surface border border-line text-ink"
          />
        </div>

        {/* Preview */}
        <div className="flex flex-col gap-2">
          <span className="text-sm font-semibold uppercase tracking-wider text-ink-muted">
            Preview
          </span>
          <div className="h-64 rounded-md overflow-hidden relative border border-line">
            {hasInput
              ? (
                  <PreviewCanvas
                    css={css}
                    className="absolute inset-0 w-full h-full"
                  />
                )
              : (
                  <div className="absolute inset-0 flex items-center justify-center select-none bg-[repeating-conic-gradient(var(--color-surface)_0%_25%,transparent_0%_50%)] bg-size-[20px_20px]">
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
        className="px-5 py-2.5 rounded-full flex items-center gap-1.5 text-sm font-medium transition-all border bg-surface text-ink-muted border-line cursor-not-allowed enabled:bg-accent enabled:text-white enabled:border-transparent enabled:cursor-pointer enabled:active:scale-97 enabled:hover:opacity-90"
      >
        Analyse layers
        <Layers size={14} />
      </button>
    </motion.div>
  )
}
