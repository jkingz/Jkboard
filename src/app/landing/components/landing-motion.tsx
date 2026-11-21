"use client"

import { useEffect, useRef, useState, type RefObject } from "react"
import { animate, useInView, useReducedMotion } from "motion/react"

/** Shared easing for the landing page: fast start, long soft settle. */
export const ease = [0.22, 1, 0.36, 1] as const

/** Counts up to `value` once on screen, and glides to each new value after that. */
export function CountUp({ value, className }: { value: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: "0px 0px -10% 0px" })
  const reduced = useReducedMotion()

  // Counts from 0 on first view, then from the last shown value when `value` changes.
  const shown = useRef(0)

  useEffect(() => {
    const node = ref.current
    if (!node || !inView || reduced) return
    const controls = animate(shown.current, value, {
      duration: 1.4,
      ease,
      onUpdate: (latest) => {
        shown.current = latest
        node.textContent = String(Math.round(latest))
      },
    })
    return () => controls.stop()
  }, [inView, reduced, value])

  // Server and no-JS render the real number; the effect rewinds it to 0 and counts up.
  return (
    <span ref={ref} className={className}>
      {value}
    </span>
  )
}

/**
 * Increments every `ms` while `ref` is on screen, for previews that act out a
 * workflow. Stays at 0 for reduced-motion visitors, so they see the still state.
 */
export function useTicker(ref: RefObject<Element | null>, ms: number) {
  const inView = useInView(ref, { margin: "-15% 0px" })
  const reduced = useReducedMotion()
  const [tick, setTick] = useState(0)

  useEffect(() => {
    if (!inView || reduced) return
    const id = setInterval(() => setTick((t) => t + 1), ms)
    return () => clearInterval(id)
  }, [inView, reduced, ms])

  return tick
}
