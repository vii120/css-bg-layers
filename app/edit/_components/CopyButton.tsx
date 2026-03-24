'use client'

import { Copy, CheckCircle } from 'lucide-react'
import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { sendGAEvent } from '@next/third-parties/google'

export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    if (copied) return

    sendGAEvent('event', 'copy_css')
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    })
  }

  return (
    <button
      onClick={handleCopy}
      className={`w-20 text-xs px-2.5 py-1 rounded border transition-all cursor-pointer flex justify-center overflow-hidden relative ${
        copied
          ? 'border-accent/30 bg-accent/8 text-accent'
          : 'border-line bg-canvas hover:bg-surface text-ink-muted'
      }`}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.div
          key={copied ? 'copied' : 'copy'}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ type: 'spring', duration: 0.25 }}
          className="flex justify-center items-center gap-1.5"
        >
          {copied ? (
            <>
              <CheckCircle size={14} />
              Copied
            </>
          ) : (
            <>
              <Copy size={14} />
              Copy
            </>
          )}
        </motion.div>
      </AnimatePresence>
    </button>
  )
}
