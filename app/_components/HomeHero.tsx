'use client'

import { motion } from 'motion/react'
import { HeadingDeco } from './HeadingDeco'

export function HomeHero() {
  return (
    <motion.div
      className="text-center flex flex-col items-center gap-6"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.25, 1, 0.5, 1] }}
    >
      <h1 className="text-3xl md:text-[2.5em] font-semibold tracking-tight leading-snug relative font-heading">
        Break down
        <br />
        CSS backgrounds,
        <br />
        <span className="relative z-1 px-2  before:absolute before:inset-0 before:rounded-sm before:bg-linear-[80deg,var(--color-blue-300),var(--color-blue-100)_5%_30%,var(--color-blue-200)_50%_95%,var(--color-blue-400)] before:-skew-x-3 before:-skew-y-1 before:-z-1">
          layer by layer
        </span>
        <HeadingDeco />
      </h1>
      <p className="text-lg leading-relaxed text-ink-muted">
        Paste any background CSS
        <br className="hidden md:block" />
        and see what each layer contributes — separately.
      </p>
    </motion.div>
  )
}
