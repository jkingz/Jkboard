"use client"

import Link from "next/link"
import {
  ArrowRight,
  LayoutDashboard,
  TrendingUp,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { DEMO_EMAIL, DEMO_PASSWORD } from "@/lib/demo"

export function CTASection() {
  return (
    <section className="py-16 lg:py-24 bg-muted/80">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="text-center">
            <div className="flex flex-col gap-8">
              {/* Badge and Stats */}
              <div className="flex flex-col items-center gap-4">
                <Badge variant="outline" className="flex items-center gap-2">
                  <TrendingUp />
                  Project & task management
                </Badge>

                <div className="text-muted-foreground flex items-center gap-4 text-sm">
                  <span className="flex items-center gap-1">
                    <div className="size-2 rounded-full bg-success" />
                    Free for individuals
                  </span>
                  <Separator
                    orientation="vertical"
                    className="h-4! data-vertical:self-center"
                  />
                  <span>No credit card required</span>
                  <Separator
                    orientation="vertical"
                    className="h-4! data-vertical:self-center"
                  />
                  <span>Cancel anytime</span>
                </div>
              </div>

              {/* Main Content */}
              <div className="flex flex-col gap-6">
                <h1 className="text-4xl font-bold tracking-tight text-balance sm:text-5xl lg:text-6xl">
                  Stop chasing updates and
                  <span className="flex sm:inline-flex justify-center">
                    <span className="relative mx-2">
                      <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                        start shipping
                      </span>
                      <div className="absolute start-0 -bottom-2 h-1 w-full bg-gradient-to-r from-primary/30 to-secondary/30" />
                    </span>
                    on time
                  </span>
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
                  Get Started Free
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
                  Open Live Demo
                </Button>
              </div>

              <div className="mx-auto max-w-md rounded-lg border border-dashed bg-background/60 p-4 text-left">
                <p className="mb-2 text-xs text-muted-foreground">
                  Demo credentials — the workspace is shared, so treat changes as
                  temporary.
                </p>
                <dl className="grid gap-1 font-mono text-xs">
                  <div className="flex gap-2">
                    <dt className="w-20 shrink-0 text-muted-foreground">Email</dt>
                    <dd className="select-all">{DEMO_EMAIL}</dd>
                  </div>
                  <div className="flex gap-2">
                    <dt className="w-20 shrink-0 text-muted-foreground">Password</dt>
                    <dd className="select-all">{DEMO_PASSWORD}</dd>
                  </div>
                </dl>
              </div>

              {/* Trust Indicators */}
              <div className="text-muted-foreground flex flex-wrap items-center justify-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <div className="size-2 rounded-full bg-success me-1" />
                  <span>Unlimited projects on every plan</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="size-2 rounded-full bg-info me-1" />
                  <span>Calendar sync with deadlines</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="size-2 rounded-full bg-warning me-1" />
                  <span>Daily progress digest by email</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}