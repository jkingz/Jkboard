"use client"

import Link from "next/link"
import { ArrowRight, LayoutDashboard } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Reveal } from "@/components/reveal"

export function CTASection() {
  return (
    <section className="border-t bg-muted/40 py-16 lg:py-24">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="text-center">
            <Reveal className="flex flex-col gap-8">
              {/* Main Content */}
              <div className="flex flex-col gap-6">
                <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl lg:text-5xl">
                  Look at it before you sign up for anything
                </h1>

                <p className="text-muted-foreground mx-auto max-w-2xl text-balance lg:text-xl">
                  Create your first project in under a minute, import the work
                  you already have, and let Jkboard keep the deadlines visible.
                </p>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col justify-center gap-4 sm:flex-row sm:gap-6">
                <Button
                  size="lg"
                  className="cursor-pointer px-8 py-6 text-lg font-medium"
                  nativeButton={false}
                  render={<Link href="/sign-up" />}
                >
                  Create an account
                  <ArrowRight data-icon="inline-end" />
                </Button>
                {/* /sign-in, not /dashboard: an anonymous visitor sent to the
                    dashboard is bounced straight back here by the proxy. */}
                <Button
                  variant="outline"
                  size="lg"
                  className="cursor-pointer px-8 py-6 text-lg font-medium"
                  nativeButton={false}
                  render={<Link href="/sign-in" />}
                >
                  <LayoutDashboard data-icon="inline-start" />
                  Open the demo workspace
                </Button>
              </div>

              <div className="mx-auto max-w-md border-t pt-6 text-sm text-muted-foreground">
                The demo workspace is shared, so treat anything you change in it
                as temporary.
              </div>

              {/* What is actually true about access. No payment provider is
                  wired up, so there is no trial to speak of. */}
              <div className="text-muted-foreground flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm">
                <span className="flex items-center gap-2">
                  <span className="size-1.5 rounded-full bg-primary" />
                  No billing, no card
                </span>
                <span className="flex items-center gap-2">
                  <span className="size-1.5 rounded-full bg-primary" />
                  Email and password only
                </span>
                <span className="flex items-center gap-2">
                  <span className="size-1.5 rounded-full bg-primary" />
                  One shared workspace per account
                </span>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  )
}