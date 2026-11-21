"use client"

import { MotionConfig } from "motion/react"
import { LandingNavbar } from "./components/navbar"
import { HeroSection } from "./components/hero-section"
import { WalkthroughSection } from "./components/walkthrough-section"
import { CTASection } from "./components/cta-section"
import { LandingFooter } from "./components/footer"
import { PageGrain } from "@/components/page-grain"

export function LandingPageContent() {
  return (
    // "user": transforms and layout moves are skipped for prefers-reduced-motion.
    <MotionConfig reducedMotion="user">
      <div className="landing min-h-screen bg-background text-foreground">
        {/* Film grain over the whole page. Fixed rather than absolute so it
            covers the full scroll height without a tall element. */}
        <PageGrain />

        {/* Navigation */}
        <LandingNavbar />

        {/* Main Content */}
        <main>
          <HeroSection />
          <WalkthroughSection />
          <CTASection />
        </main>

        {/* Footer */}
        <LandingFooter />
      </div>
    </MotionConfig>
  )
}
