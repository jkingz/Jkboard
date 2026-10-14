"use client"

import Link from "next/link"
import { Check } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Reveal } from "@/components/reveal"

/**
 * Pricing, honestly: there is one price and it is nothing.
 *
 * The section previously sold Starter, Team and Business plans at 0/12/29 per
 * month with a highlighted middle tier. No payment provider is wired up, there
 * is no subscription table, and `settings/billing` renders committed JSON.
 * DESIGN.md -> Honesty constraints forbids that, so the section states the real
 * position and invites people to make use of it.
 *
 * The one thing a reader must not be misled about is that the demo workspace is
 * writable and shared. That is stated here rather than buried, because
 * "explore freely" would otherwise read as "safe to try".
 */
const included = [
  "Every project, task and teammate view",
  "Kanban boards, task table and deadline calendar",
  "Workload per teammate",
  "Progress and completion trends",
  "Email and password accounts",
  "Every feature that exists, with no tier to unlock",
]

const stillBuilding = [
  "Importing work from another tracker",
  "Separate workspaces per account",
  "Roles and permissions beyond a free-text title",
  "Billing, of any kind",
]

export function PricingSection() {
  return (
    <section id="pricing" className="border-t py-20 sm:py-28">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          <Reveal>
            <div className="flex flex-col gap-5">
              <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                It is free, and early
              </h2>
              <p className="text-muted-foreground text-pretty">
                Jkboard is an early build. There is no paid plan, no trial to
                start and nothing to cancel, because no payment details are
                collected anywhere in the product.
              </p>
              <p className="text-muted-foreground text-pretty">
                That means you get every part of it to poke at now, while it is
                still cheap to change. Explore it properly: create projects,
                move tasks around a board, invite a teammate, put work past its
                due date and see what the app does with it.
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
                  Explore the shared demo
                </Button>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="flex flex-col gap-8">
              <div>
                <h3 className="mb-3 text-sm font-medium">
                  What you can use today
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
                  Still being built
                </h3>
                <ul className="grid gap-2.5">
                  {stillBuilding.map((item) => (
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

              {/*
                Worth being blunt about: no server action checks a role, so any
                signed-in visitor can delete projects. Saying so is better than
                letting someone discover it by losing the demo data.
              */}
              <p className="border-l-2 border-warning pl-3 text-xs text-muted-foreground">
                One thing to know: the shared demo workspace is open to every
                visitor, and permissions are not enforced yet, so treat it as a
                scratch pad. Use your own account for anything you want to keep.
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}