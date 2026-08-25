'use client'

import { useEffect } from 'react'
import { highlightCss } from '@/lib/syntax'

export function CssViewer({ code }: { code: string }) {
  useEffect(() => {
    highlightCss()
  }, [code])

  return (
    <pre className="bg-surface rounded-md p-4 border border-line overflow-auto max-h-[60vh] font-mono text-xs leading-[1.65] whitespace-pre-wrap break-words">
      <code className="language-css">{code}</code>
    </pre>
  )
}
