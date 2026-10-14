"use client"

import Link from "next/link"

import { Separator } from "@/components/ui/separator"
import { Logo } from "@/components/logo"
import { Reveal } from "@/components/reveal"

/**
 * Footer links only point at things that exist.
 *
 * The previous version had three problems: a newsletter form that resolved
 * `Promise.resolve(email)` and toasted a success without storing anything
 * anywhere (a dead control, R-26); "Privacy" and "Terms" pointing at the FAQ;
 * and "Security" pointing at the integrations settings page. All removed.
 */
const footerLinks = {
  product: [
    { name: "Features", href: "#features" },
    { name: "Pricing", href: "#pricing" },
    { name: "FAQ", href: "#faq" },
    { name: "Live demo", href: "/sign-in" },
  ],
  workspace: [
    { name: "Overview", href: "/dashboard" },
    { name: "Projects", href: "/projects" },
    { name: "Tasks", href: "/tasks" },
    { name: "Calendar", href: "/calendar" },
  ],
  account: [
    { name: "Team", href: "/users" },
    { name: "Profile", href: "/settings/user" },
    { name: "Notifications", href: "/settings/notifications" },
    { name: "Billing", href: "/settings/billing" },
  ],
}

export function LandingFooter() {
  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/landing" className="flex items-center gap-2">
              <Logo size={28} />
              <span className="text-lg font-semibold">Jkboard</span>
            </Link>
            <p className="mt-3 max-w-xs text-sm text-muted-foreground text-pretty">
              Project and task management for small teams. One shared workspace,
              no billing.
            </p>
          </div>

          {Object.entries(footerLinks).map(([group, links]) => (
            <Reveal key={group} delay={0.05}>
              <div>
                <h2 className="mb-3 text-sm font-medium">{group}</h2>
                <ul className="flex flex-col gap-2">
                  {links.map((link) => (
                    <li key={link.name}>
                      <Link
                        href={link.href}
                        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col items-center justify-between gap-2 text-sm text-muted-foreground sm:flex-row">
          <span>&copy; {new Date().getFullYear()} Jkboard</span>
          {/* No legal or security links: none of those pages exist, and a
              "Privacy" link pointing at the FAQ is worse than no link. */}
          <span>Built as a working demo</span>
        </div>
      </div>
    </footer>
  )
}