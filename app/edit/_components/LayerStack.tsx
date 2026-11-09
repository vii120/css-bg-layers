'use client'

import { PreviewCanvas } from '@/app/_components/PreviewCanvas'
import { cn } from '@/lib/utils'

// Out: snappy ease-out spread. Back: ease-in-out so the collapse stays visible
export const CURVE_OUT = 'cubic-bezier(0.22,1,0.36,1)'
export const CURVE_BACK = 'cubic-bezier(0.65,0,0.35,1)'

const GAP = 80
const GAP_EXTRA = GAP * 1.25
const SCALE = 0.72
const TILT = 55

/**
 * Vertical room the spread stack needs beyond the flat preview. Assumes the
 * worst case (a middle plane selected) so the frame doesn't jump on click.
 */
export function stackOverflow(count: number) {
  const gaps = Math.max(count - 1, 0)
  return (gaps * GAP + Math.min(gaps, 2) * GAP_EXTRA) * Math.sin((TILT * Math.PI) / 180) * SCALE
}

export interface Plane {
  key: string | number
  label: string
  css: string
  blend?: string
}

/**
 * The background preview, one plane per layer. Flat (2D), the transparent
 * planes composite into exactly the combined background; in 3D they spread
 * apart on solid backings. Same element both ways, so the toggle is one
 * continuous motion. Clicking a plane opens up space around it.
 */
export function LayerStack({
  planes,
  is3d,
  active,
  onSelect,
}: {
  planes: Plane[]
  is3d: boolean
  active: string | number | undefined
  onSelect: (key: string | number) => void
}) {
  const activeIdx = planes.findIndex((p) => p.key === active)

  // Walk top → bottom; gaps touching the active plane get extra room
  const zs = [0]
  for (let i = 1; i < planes.length; i++) {
    const touchesActive = i === activeIdx || i - 1 === activeIdx
    zs.push(zs[i - 1] - GAP - (touchesActive ? GAP_EXTRA : 0))
  }
  const center = zs.at(-1)! / 2
  const curve = is3d ? CURVE_OUT : CURVE_BACK

  return (
    <>
      {/* 2D frame. Sits outside the isolated group so blend modes never mix
          with it, matching background-blend-mode (which ignores what's behind) */}
      <div
        className={cn(
          'absolute inset-0 rounded-md bg-surface shadow-[0_0_0_1px_var(--border)] transition-opacity motion-reduce:transition-none',
          is3d ? 'opacity-0 duration-150' : 'opacity-100 duration-500 delay-200',
        )}
      />
      <div className="absolute inset-0 isolate">
        <div
          className="absolute inset-0 transform-3d transition-transform duration-700 motion-reduce:transition-none"
          style={{
            // `none` when flat: any transform would break background-attachment: fixed
            transform: is3d
              ? `scale(${SCALE}) rotateX(${TILT}deg) rotateZ(-25deg)`
              : 'none',
            transitionTimingFunction: curve,
          }}
        >
          {/* Bottom plane first in DOM: when flat, coplanar planes paint in DOM
              order, so the top layer must come last to stay on top */}
          {planes.map((p, i) => ({ p, i })).reverse().map(({ p, i }) => (
            <div
              key={p.key}
              {...(is3d && {
                'role': 'button',
                'tabIndex': 0,
                'aria-label': `Select ${p.label}`,
                'aria-pressed': p.key === active,
                'onClick': () => onSelect(p.key),
                'onKeyDown': (e: React.KeyboardEvent) => {
                  if (e.key !== 'Enter' && e.key !== ' ') return
                  e.preventDefault()
                  onSelect(p.key)
                },
              })}
              className={cn(
                'absolute inset-0 rounded-md outline-none transition-[transform,background-color,box-shadow] motion-reduce:transition-none',
                is3d
                  // Outline shifts toward the accent on hover/focus; shadow is quick so hover feels instant
                  ? 'cursor-pointer bg-canvas shadow-[0_0_0_1px_var(--border),0_8px_24px_-12px_rgb(26_26_26/0.08)] hover:shadow-[0_0_0_1px_color-mix(in_oklch,var(--accent)_40%,var(--border)),0_8px_24px_-12px_rgb(26_26_26/0.08)] focus-visible:shadow-[0_0_0_1px_color-mix(in_oklch,var(--accent)_40%,var(--border)),0_8px_24px_-12px_rgb(26_26_26/0.08)] [transition-duration:700ms,700ms,150ms]'
                  // Backings hold briefly, then fade over 500ms, ending as the stack lands (700ms)
                  : 'bg-transparent shadow-none [transition-duration:700ms,500ms,500ms]',
              )}
              style={{
                transform: is3d ? `translateZ(${zs[i] - center}px)` : 'none',
                transitionTimingFunction: curve,
                // ponytail: top layers lead the spread, a light stagger reads as "peeling apart"
                transitionDelay: is3d ? `${i * 30}ms, ${i * 30}ms, 0ms` : '0ms, 200ms, 200ms',
                // In 3D each layer is inspected on its own, unblended
                mixBlendMode: is3d ? undefined : (p.blend as React.CSSProperties['mixBlendMode']),
              }}
            >
              <PreviewCanvas css={p.css} className="absolute inset-0 rounded-md" />
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
