"use client"

import { useRef } from "react"
import dynamic from "next/dynamic"
import Link from "next/link"
import { motion, useScroll, useTransform } from "motion/react"

import { Button } from "@/components/ui/button"
import { DemoButton } from "./demo-button"
import { ProductPreview } from "./product-preview"
import { ease } from "./landing-motion"

// WebGL only exists in the browser; the hero is complete without it.
const HeroScene = dynamic(() => import("./hero-scene"), { ssr: false })

/**
 * Copy and layout follow the teal "Landing page redesign" board in Paper.
 * docs/ui.md → Motion allows exactly one transition here: the product preview.
 */
export function HeroSection() {
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] })
  // The preview drifts up and tilts back as the hero scrolls away.
  const previewY = useTransform(scrollYProgress, [0, 1], [0, -80])
  const previewRotate = useTransform(scrollYProgress, [0, 1], [0, 6])

  return (
    <section
      ref={ref}
      id="workspace"
      className="landing-band landing-invert relative overflow-hidden pt-16 pb-20 lg:pt-24 lg:pb-28"
    >
      <HeroScene />
      <div className="landing-container relative grid items-center gap-12 lg:grid-cols-[1fr_1.15fr] lg:gap-18">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease }}
        >
          <h1 className="landing-display">See what’s moving. See what’s late.</h1>
          <p className="mt-6 max-w-md text-lg/[25px] text-muted-foreground text-pretty">
            Plan projects, assign tasks, and keep deadlines in view across one
            shared workspace.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <DemoButton />
            <Button size="lg" variant="outline" nativeButton={false} render={<Link href="/sign-up" />}>
              Create an account
            </Button>
          </div>
          <p className="mt-4 text-[13px] text-muted-foreground">
            One click signs you in to the shared demo. No account needed.
          </p>
        </motion.div>

        {/* Outer layer follows scroll, inner layer plays the entrance; one y each. */}
        <motion.div style={{ y: previewY, rotateX: previewRotate, transformPerspective: 1200 }}>
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 1.1, ease, delay: 0.15 }}
          >
            <ProductPreview kind="overview" className="shadow-2xl shadow-black/30" />
          </motion.div>
        </motion.div>
      </div>

    </section>
  )
}
