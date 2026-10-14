"use client"

import * as React from "react"

/**
 * Scroll-triggered reveal, per DESIGN.md → Motion.
 *
 * Purpose: signals that content continues below the fold and gives sections a
 * reading order. It fires once on intersection and never loops.
 *
 * Two details that are easy to get wrong:
 *
 * - The reduced-motion and no-IntersectionObserver cases are decided during
 *   render, not in the effect. Deciding them in the effect would call setState
 *   synchronously inside it, which is the cascading-render pattern React warns
 *   against (`react-hooks/set-state-in-effect`).
 * - Once shown, the observer disconnects. Nothing re-hides on scroll-out, so
 *   the element cannot flicker when a reader scrolls back up.
 */

/** Read once at render. Safe because it is only ever read on the client. */
function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  )
}

function supportsObserver() {
  return typeof window !== "undefined" && "IntersectionObserver" in window
}

export function Reveal({
  children,
  className,
  id,
  /** Seconds. Deliberately small; large values read as sluggish. */
  delay = 0,
  as: Tag = "div",
}: {
  children: React.ReactNode
  className?: string
  id?: string
  delay?: number
  /** Rendered as a `div` by default; used for landmarks where needed. */
  as?: "div" | "section"
}) {
  const [shown, setShown] = React.useState(
    () => typeof window === "undefined" || prefersReducedMotion() || !supportsObserver()
  )
  const ref = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (shown) return
    const node = ref.current
    if (!node || !supportsObserver()) return

    const observer = new IntersectionObserver(
      (entries) => {
        // Callback, not the effect body, so the setState is an external
        // subscription update rather than a synchronous cascade.
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setShown(true)
            observer.disconnect()
            break
          }
        }
      },
      // Fire slightly before the element is fully on screen so the reveal has
      // finished by the time the reader's eye arrives.
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [shown])

  return (
    <Tag
      ref={ref}
      id={id}
      data-revealed={shown ? "true" : "false"}
      style={delay ? { transitionDelay: `${delay}s` } : undefined}
      className={[
        "transition-[opacity,transform] duration-500 ease-out motion-reduce:transition-none",
        shown ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0",
        className ?? "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </Tag>
  )
}