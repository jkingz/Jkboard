"use client"

import Link from "next/link"
import { Check } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Reveal } from "@/components/reveal"

/**
 * There is no billing.
 *
 * The previous version of this section sold Starter, Team and Business plans
 * with a per-seat toggle and a highlighted middle tier. No payment provider is
 * wired up: there is no Stripe integration, no subscription table, and the
 * billing settings page renders committed JSON fixtures. DESIGN.md → Honesty
 * constraints forbids claiming a capability that does not exist, so the section
 * states the actual position instead of pricing one.
 */
const included = [
  "Every project, task and teammate view",
  "Kanban boards, task table and deadline calendar",
  "Workload per teammate",
  "Progress and completion trends",
  "Email and password accounts",
  "No card, no trial, no cancellation",
]

const notYet = [
  "Importing work from another tracker",
  "Multiple workspaces per account",
  "Roles and permissions beyond a free-text title",
  "Any kind of billing",
]

export function PricingSection() {
  return (
    <section id="pricing" className="border-t py-20 sm:py-28">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          <Reveal>
            <div className="flex flex-col gap-4">
              <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                It costs nothing, because there is nothing to charge for
              </h2>
              <p className="text-muted-foreground text-pretty">
                Jkboard has no billing system and collects no payment details.
                Sign up with an email address and you get the whole thing: every
                view below is included, with no tier to upgrade to and nothing to
                cancel later.
              </p>
              <div className="flex flex-wrap gap-3 pt-2">
                <Button
                  className="cursor-pointer"
                  nativeButton={false}
                  render={<Link href="/sign-up" />}
                >
                  Create an account
                </Button>
                <Button
                  variant="outline"
                  className="cursor-pointer"
                  nativeButton={false}
                  render={<Link href="/sign-in" />}
                >
                  Try the demo first
                </Button>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="flex flex-col gap-8">
              <div>
                <h3 className="mb-3 text-sm font-medium">
                  What you get with an account
                </h3>
                <ul className="grid gap-2.5">
                  {included.map((item) => (
                    <li key={item} className="flex items-start gap-2.5">
                      <Check
                        className="mt-0.5 size-4 shrink-0 text-primary"
                        aria-hidden="true"
                      />
                      <span className="text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="mb-3 text-sm font-medium text-muted-foreground">
                  Not built yet
                </h3>
                <ul className="grid gap-2.5">
                  {notYet.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-2.5 text-muted-foreground"
                    >
                      <span
                        className="mt-2 size-1.5 shrink-0 rounded-full bg-muted-foreground/40"
                        aria-hidden="true"
                      />
                      <span className="text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}