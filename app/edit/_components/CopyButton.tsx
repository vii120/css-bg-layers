'use client'

import { sendGAEvent } from '@next/third-parties/google'
import { CheckCircle, Copy } from 'lucide-react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useState } from 'react'

export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  const reduceMotion = useReducedMotion()

  function handleCopy() {
    if (copied)
      return

    sendGAEvent('event', 'copy_css')
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(setCopied, 1800, false)
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
          initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 4, filter: 'blur(2px)' }}
          animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, filter: 'blur(0px)' }}
          exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -4, filter: 'blur(2px)' }}
          transition={{ duration: reduceMotion ? 0 : 0.15, ease: 'easeInOut' }}
          className="flex justify-center items-center gap-1.5"
        >
          {copied
            ? (
                <>
                  <CheckCircle size={14} />
                  Copied
                </>
              )
            : (
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
