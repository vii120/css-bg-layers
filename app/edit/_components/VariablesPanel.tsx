'use client'

import { sendGAEvent } from '@next/third-parties/google'
import { ChevronDown } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useState } from 'react'
import { cn } from '@/lib/utils'

interface Props {
  cssVars: { name: string; value: string }[]
  onUpdate: (name: string, value: string) => void
}

export function VariablesPanel({ cssVars, onUpdate }: Props) {
  const [open, setOpen] = useState(true)

  return (
    <div className="max-h-50 flex flex-col gap-3 shrink-0">
      <button
        onClick={() => {
          sendGAEvent('event', 'toggle_variables_panel')
          setOpen(v => !v)
        }}
        className="flex items-center gap-1.5 cursor-pointer pl-3 border-l-3 border-accent py-0.5"
      >
        <h2 className="font-semibold text-sm uppercase tracking-wider text-ink flex items-center gap-2">
          Variables
          <span className="text-xs font-normal normal-case tracking-normal px-1.5 py-0.5 rounded bg-surface text-ink-muted">
            {cssVars.length}
          </span>
        </h2>
        <ChevronDown
          size={12}
          className={cn('ml-auto text-ink-muted transition-transform', !open && '-rotate-90')}
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.25, 1, 0.5, 1] }}
            className="overflow-hidden"
          >
            <div className="max-h-50 overflow-auto flex flex-col gap-1">
              {cssVars.map(v => (
                <div
                  key={v.name}
                  className="shrink-0 flex gap-3 text-xs font-mono px-3 py-1.5 rounded bg-surface border border-line"
                >
                  <span className="text-ink-muted shrink-0">{v.name}</span>
                  <input
                    className="select-text text-ink flex-1 min-w-0 bg-transparent outline-none rounded px-1.5 py-0.5 -mx-1.5 hover:bg-canvas focus:bg-canvas transition-colors"
                    value={v.value}
                    onChange={e => onUpdate(v.name, e.target.value)}
                    spellCheck={false}
                  />
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
