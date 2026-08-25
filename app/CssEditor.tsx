'use client'

import type { Ref } from 'react'
import { useEffect, useRef } from 'react'
import { highlightCss } from '@/lib/syntax'
import { cn } from '@/lib/utils'

// Both layers must break lines identically or the caret drifts off the glyphs.
const typeStyles
  = 'm-0 p-4 font-mono text-[13px] leading-[1.65] whitespace-pre-wrap break-words'

export function CssEditor({
  value,
  onChange,
  placeholder,
  className,
  ref,
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  className?: string
  ref?: Ref<HTMLTextAreaElement>
}) {
  const preRef = useRef<HTMLPreElement>(null)

  useEffect(() => {
    highlightCss()
  }, [value])

  return (
    <div className={cn('relative', className)}>
      <pre
        ref={preRef}
        aria-hidden
        className={cn(typeStyles, 'absolute inset-0 overflow-hidden')}
      >
        {/* Trailing newline gives the last line height when the caret sits on it. */}
        <code className="language-css">{`${value}\n`}</code>
      </pre>
      <textarea
        ref={ref}
        value={value}
        onChange={e => onChange(e.target.value)}
        onScroll={e => preRef.current?.scrollTo(e.currentTarget.scrollLeft, e.currentTarget.scrollTop)}
        placeholder={placeholder}
        aria-label="CSS input"
        spellCheck={false}
        autoCapitalize="off"
        autoCorrect="off"
        className={cn(
          typeStyles,
          'absolute inset-0 resize-none outline-none',
          'bg-transparent text-transparent caret-[#3b52d4]',
          'placeholder:text-[#b0a89e] selection:bg-[#3b52d4]/15',
          // Hidden so the textarea's content width matches the <pre> and lines wrap alike.
          '[scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
        )}
      />
    </div>
  )
}
