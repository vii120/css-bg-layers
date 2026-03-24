'use client'

import type { CssEditorHandle } from './CssEditor'
import { sendGAEvent } from '@next/third-parties/google'
import { motion } from 'motion/react'
import { useRef } from 'react'
import { CssInputSection } from './_components/CssInputSection'
import { DemoPlayground } from './_components/DemoPlayground'
import { ExamplesGrid } from './_components/ExamplesGrid'
import { Footer } from './_components/Footer'
import { HomeHero } from './_components/HomeHero'

export default function Home() {
  const editorRef = useRef<CssEditorHandle>(null)

  function scrollToEditor() {
    document
      .getElementById('css-input')
      ?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    setTimeout(() => editorRef.current?.focus(), 400)
    sendGAEvent('event', 'try_css_input')
  }

  return (
    <div className="min-h-screen flex flex-col bg-canvas text-ink">
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 md:px-8 py-10 md:py-16 space-y-12 md:space-y-16">
        <HomeHero />

        {/* Demo */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1, ease: [0.25, 1, 0.5, 1] }}
          className="flex flex-col items-center gap-8"
        >
          <DemoPlayground />
          <button
            onClick={scrollToEditor}
            className="text-sm font-medium bg-accent text-white px-5 py-2.5 rounded-full cursor-pointer transition-all hover:opacity-90 active:scale-97"
          >
            Try it with your own CSS
          </button>
        </motion.div>

        <CssInputSection editorRef={editorRef} />

        <ExamplesGrid />
      </main>

      <Footer />
    </div>
  )
}
