import type { Metadata } from 'next'
import { GoogleAnalytics } from '@next/third-parties/google'
import {
  Bricolage_Grotesque,
  Geist,
  Geist_Mono,
  Space_Grotesk,
} from 'next/font/google'
import Link from 'next/link'
import { Toaster } from '@/components/ui/sonner'
import { cn } from '@/lib/utils'
import './globals.css'

const geist = Geist({ subsets: ['latin'], variable: '--font-sans' })

const spaceGrotesk = Space_Grotesk({
  variable: '--font-space-grotesk',
  subsets: ['latin'],
})

const bricolage = Bricolage_Grotesque({
  variable: '--font-bricolage',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'bg.layers - CSS Background Layer Editor',
  description:
    'A powerful CSS background tool to split, edit, and visualize multiple background layers in complex CSS designs. Make every layer easy to see, understand, and manage.',
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    apple: [{ url: '/apple-touch-icon.png' }],
  },
  manifest: '/site.webmanifest',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={cn(
        'h-full',
        'antialiased',
        spaceGrotesk.variable,
        geistMono.variable,
        bricolage.variable,
        'font-sans',
        geist.variable,
      )}
    >
      <body className="min-h-full flex flex-col">
        <header className="px-4 md:px-8 h-16 flex items-center shrink-0 border-b border-line">
          <Link href="/" className="flex items-center gap-3">
            <img src="/logo.png" alt="bg.layers logo" className="w-7" />
            <span className="text-[1.35rem] font-bold tracking-tight">
              bg.layers
            </span>
          </Link>
        </header>
        {children}
        <Toaster position="top-center" />
        {process.env.NODE_ENV === 'production' && (
          <GoogleAnalytics gaId="G-E5E297PGYE" />
        )}
      </body>
    </html>
  )
}
