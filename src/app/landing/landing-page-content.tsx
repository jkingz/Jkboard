"use client"

import React from "react"
import { LandingNavbar } from "./components/navbar"
import { HeroSection } from "./components/hero-section"
import { StatsSection } from "./components/stats-section"
import { FeaturesSection } from "./components/features-section"
import { PricingSection } from "./components/pricing-section"
import { FaqSection } from "./components/faq-section"
import { CTASection } from "./components/cta-section"
import { LandingFooter } from "./components/footer"
import {
  ThemeCustomizer,
  ThemeCustomizerTrigger,
} from "@/components/theme-customizer"

export function LandingPageContent() {
  const [themeCustomizerOpen, setThemeCustomizerOpen] = React.useState(false)

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <LandingNavbar />

      {/* Main Content */}
      <main>
        <HeroSection />
        <StatsSection />
        <FeaturesSection />
        <PricingSection />
        <FaqSection />
        <CTASection />
      </main>

      {/* Footer */}
      <LandingFooter />

      {/* Theme Customizer — shared with the dashboard */}
      <ThemeCustomizerTrigger
        onClick={() => setThemeCustomizerOpen(true)}
      />
      <ThemeCustomizer
        open={themeCustomizerOpen}
        onOpenChange={setThemeCustomizerOpen}
      />
    </div>
  )
}