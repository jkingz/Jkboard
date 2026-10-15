"use client"

import * as React from "react"

/**
 * Scroll-triggered reveal, per docs/ui.md → Motion.
 *
 * Purpose: signals that content continues below the fold and gives sections a
 * reading order. It fires once on intersection and never loops.
 *
 * The SSR/client split is the detail that is easy to get wrong here. The server
 * has no `window`, so any `typeof window` branch inside a `useState` initializer
 * produces a different first render on the client and React reports a hydration
 * mismatch it cannot patch. `useSyncExternalStore` is the way out: its
 * `getServerSnapshot` is used for both the server render *and* the hydration
 * render, and only afterwards does React switch to the client snapshot. That
 * buys two things at once — the HTML ships with the content visible, which is
 * what a crawler or a no-JS reader needs, and the animation still plays.
 *
 * Once shown, the observer disconnects. Nothing re-hides on scroll-out, so the
 * element cannot flicker when a reader scrolls back up.
 */

/** This value never changes after mount, so there is nothing to subscribe to. */
function noopSubscribe() {
  return () => {}
}

function canAnimateOnClient() {
  return (
    typeof window !== "undefined" &&
    "IntersectionObserver" in window &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches
  )
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
  // False on the server and false during hydration; becomes the real value
  // immediately after. Identical first render on both sides is the whole point.
  const canAnimate = React.useSyncExternalStore(
    noopSubscribe,
    canAnimateOnClient,
    // Server and hydration snapshot: never animate, so ship it visible.
    () => false
  )

  const [revealed, setRevealed] = React.useState(false)
  const shown = revealed || !canAnimate

  const ref = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (!canAnimate || revealed) return
    const node = ref.current
    if (!node) return

    const observer = new IntersectionObserver(
      (entries) => {
        // Callback, not the effect body, so the setState is an external
        // subscription update rather than a synchronous cascade.
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setRevealed(true)
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
  }, [canAnimate, revealed])

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