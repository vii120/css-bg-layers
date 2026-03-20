import type { Metadata } from 'next'
import { Space_Grotesk, Geist_Mono, Geist } from 'next/font/google'
import Link from 'next/link'
import './globals.css'
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const spaceGrotesk = Space_Grotesk({
  variable: '--font-space-grotesk',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Layerly - Split and edit your CSS background layers',
  description:
    'A powerful CSS background tool to split, edit, and visualize layers in complex backgrounds. Make CSS layers easy to see and manage.',
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
      className={cn("h-full", "antialiased", spaceGrotesk.variable, geistMono.variable, "font-sans", geist.variable)}
    >
      <body className="min-h-full flex flex-col">
          <header className="px-8 h-14 flex items-center shrink-0 border-b border-line">
            <Link href="/" className="flex items-center gap-3">
              <img src="/logo.png" alt="layerly-logo" className="w-6" />
              <span className="text-xl font-semibold tracking-tight">Layerly</span>
            </Link>
          </header>
          {children}
        </body>
    </html>
  )
}
