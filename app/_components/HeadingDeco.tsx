import { useEffect, useRef } from 'react'
import { motion, useAnimationFrame, useReducedMotion } from 'motion/react'
import { sendGAEvent } from '@next/third-parties/google'
import { cn } from '@/lib/utils'
import { useCssStore } from '@/lib/store'

const DECORATIONS = [
  {
    position: '-top-5 right-9/10',
    size: 'w-10',
    background:
      'bg-conic-[from_270deg_at_bottom_2px_right_2px,transparent_25%,var(--color-amber-400)_0] bg-size-[15px_15px] bg-center',
    rotate: '-rotate-15',
    depth: 1,
    css: `div {
  background-image: conic-gradient(from 270deg at bottom 2px right 2px, transparent 25%, #ffb900 0);
  background-position: center;
  background-size: 30px 30px;
}`,
  },
  {
    position: 'top-1/3 left-full ml-5',
    size: 'w-10',
    background:
      'bg-radial-[circle,var(--color-lime-500)_30%,transparent_0] bg-size-[15px_15px] bg-center',
    rotate: 'rotate-15',
    depth: 1.5,
    css: `div {
  background-image: radial-gradient(circle, #84cc16 20%, transparent 0);
  background-position: center;
  background-size: 30px 30px;
}`,
  },
  {
    position: 'bottom-0 right-full',
    size: 'w-[45px]',
    background:
      'bg-conic-[var(--color-red-400)_25%,transparent_25%_50%,var(--color-red-400)_50%_75%,transparent_75%] bg-size-[30px_30px]',
    rotate: '-rotate-20',
    depth: 2,
    css: `div {
  background-image: conic-gradient(#f87171 25%, transparent 25% 50%, #f87171 50% 75%, transparent 75%);
  background-size: 60px 60px;
}`,
  },
]

const EASING_FACTOR = 0.05

export function HeadingDeco() {
  const reduceMotion = useReducedMotion()
  const { setCss } = useCssStore()
  const mouseRef = useRef({ x: 0, y: 0 })
  const elemsRef = useRef<(HTMLDivElement | null)[]>([])
  const posRef = useRef<{ x: number; y: number }[]>([])

  useEffect(() => {
    if (reduceMotion) return

    const onMove = (e: PointerEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY }
    }
    window.addEventListener('pointermove', onMove)
    return () => window.removeEventListener('pointermove', onMove)
  }, [reduceMotion])

  useAnimationFrame(() => {
    if (reduceMotion) return

    DECORATIONS.forEach((d, i) => {
      const strength = (d.depth * -1) / 100
      const targetX = mouseRef.current.x * strength
      const targetY = mouseRef.current.y * strength
      const cur = posRef.current[i] ?? { x: 0, y: 0 }
      posRef.current[i] = {
        x: cur.x + (targetX - cur.x) * EASING_FACTOR,
        y: cur.y + (targetY - cur.y) * EASING_FACTOR,
      }
      const el = elemsRef.current[i]
      if (el)
        el.style.transform = `translate3d(${posRef.current[i].x}px, ${posRef.current[i].y}px, 0)`
    })
  })

  return (
    <>
      {DECORATIONS.map((d, i) => (
        <div
          key={i}
          ref={(el) => {
            elemsRef.current[i] = el
          }}
          onClick={() => {
            if (!d.css) return

            sendGAEvent('event', 'click_deco', { name: i })
            setCss(d.css)
            document
              .getElementById('css-input')
              ?.scrollIntoView({ behavior: 'smooth', block: 'center' })
          }}
          className={cn(
            'absolute will-change-transform',
            d.css ? 'cursor-pointer' : 'cursor-default',
            d.position,
          )}
        >
          <motion.div
            initial={
              reduceMotion
                ? false
                : {
                    opacity: 0,
                    scale: 0.8,
                    transition: {
                      duration: 0.4,
                      delay: 0.3 + i * 0.07,
                      ease: [0.215, 0.61, 0.355, 1],
                    },
                  }
            }
            animate={{ opacity: 0.75, scale: 1 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            whileHover={{ scale: 1.05 }}
            className="group"
          >
            <div
              className={cn(
                'aspect-square opacity-75 transform-[translateZ(0)] transition-opacity group-hover:opacity-100',
                d.size,
                d.background,
                d.rotate,
              )}
            ></div>
          </motion.div>
        </div>
      ))}
    </>
  )
}
