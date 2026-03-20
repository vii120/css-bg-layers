'use client'

import { useEffect, useId, useRef } from 'react'
import { extractDeclarations } from '@/lib/parseCss'

export function PreviewCanvas({
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
