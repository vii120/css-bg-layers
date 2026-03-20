'use client'

import { Copy } from 'lucide-react'
import { useState } from 'react'

export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    })
  }

  return (
    <button
      onClick={handleCopy}
      className="text-xs px-2.5 py-1 rounded border border-line bg-canvas hover:bg-surface transition-colors text-ink-muted cursor-pointer flex items-center gap-2"
    >
      <Copy size={14} />
      {copied ? 'Copied!' : 'Copy'}
    </button>
  )
}
