'use client'

import { sendGAEvent } from '@next/third-parties/google'

export function Footer() {
  return (
    <footer className="max-w-5xl w-full mx-auto px-4 md:px-8 py-6 mt-auto border-t border-line text-ink-muted flex items-center justify-end text-sm">
      <div className="flex items-center gap-4">
        <a
          href="https://github.com/vii120/css-bg-layers"
          target="_blank"
          className="underline underline-offset-2 hover:text-ink transition-colors"
          onClick={() => sendGAEvent('event', 'click_github')}
        >
          GitHub
        </a>
        <span>
          Created by{' '}
          <a
            href="https://www.vivitseng.com/"
            target="_blank"
            className="underline underline-offset-2 hover:text-ink transition-colors"
            onClick={() => sendGAEvent('event', 'click_portfolio')}
          >
            Vivi Tseng
          </a>
        </span>
      </div>
    </footer>
  )
}
