"use client"

import { useEffect, useRef } from "react"
import dynamic from "next/dynamic"
import Link from "next/link"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { motion } from "motion/react"

import { Button } from "@/components/ui/button"
import { DemoButton } from "./demo-button"
import { ProductPreview } from "./product-preview"
import { ease } from "./landing-motion"

const HeroScene = dynamic(() => import("./hero-scene"), { ssr: false })

export function HeroSection() {
  const section = useRef<HTMLElement>(null)
  const preview = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const trigger = section.current
    const target = preview.current
    if (!trigger || !target) return

    gsap.registerPlugin(ScrollTrigger)
    const media = gsap.matchMedia()
    media.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
      gsap.to(target, {
        y: -46,
        rotateX: 5,
        transformPerspective: 1200,
        ease: "none",
        scrollTrigger: { trigger, start: "top top", end: "bottom top", scrub: 0.45 },
      })
    })

    return () => media.revert()
  }, [])

  return (
    <section ref={section} id="workspace" className="landing-band relative overflow-hidden border-b pt-14 pb-9 lg:pt-21 lg:pb-11">
      <HeroScene />
      <div className="landing-container relative grid items-center gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.72, ease }}
        >
          <h1 className="landing-display">
            See what’s <span className="block text-primary">due next.</span>
          </h1>
          <p className="mt-5 max-w-md text-lg/[25px] text-muted-foreground text-pretty">
            Track deadlines, assign work, and see where projects stand in one shared workspace.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <DemoButton />
            <Button size="lg" variant="outline" nativeButton={false} render={<Link href="/sign-up" />}>
              Create an account
            </Button>
          </div>
          <p className="mt-3 text-[13px] text-muted-foreground">
            The live demo uses shared example data.
          </p>
        </motion.div>

        <div ref={preview} data-hero-preview className="min-w-0">
          <motion.div
            initial={{ opacity: 0, y: 26, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.85, ease, delay: 0.12 }}
          >
            <ProductPreview kind="board" aboveFold className="shadow-xl shadow-foreground/8" />
          </motion.div>
        </div>
      </div>
      <nav aria-label="Product features" className="landing-container relative mt-10 grid gap-3 sm:grid-cols-3">
        {[
          { href: "#how-it-works", title: "Projects", detail: "Move work through four stages." },
          { href: "#tasks", title: "Tasks", detail: "Find the work that needs attention." },
          { href: "#calendar", title: "Calendar", detail: "See deadlines and project targets together." },
        ].map(({ href, title, detail }) => (
          <a key={href} href={href} className="flex flex-col gap-1 border-t pt-3 hover:text-primary">
            <span className="font-semibold">{title}</span>
            <span className="text-sm text-muted-foreground">{detail}</span>
          </a>
        ))}
      </nav>
    </section>
  )
}
