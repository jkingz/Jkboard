"use client"

import Link from "next/link"
import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { useState } from "react"
import { cn } from "@/lib/utils"

const plans = [
  {
    name: "Starter",
    description: "For individuals planning their own work",
    monthlyPrice: 0,
    yearlyPrice: 0,
    features: [
      "Up to 3 active projects",
      "Unlimited tasks",
      "Board and list views",
      "Due dates and reminders",
      "Community support",
    ],
    cta: "Start for free",
    popular: false,
  },
  {
    name: "Team",
    description: "For small teams shipping work together",
    monthlyPrice: 12,
    yearlyPrice: 9,
    features: [
      "Unlimited projects",
      "Up to 10 teammates",
      "Workload and progress views",
      "Deadline calendar",
      "Guest collaborators",
      "Email digest and notifications",
      "Priority support",
    ],
    cta: "Start free trial",
    popular: true,
    includesPrevious: "Everything in Starter, plus",
  },
  {
    name: "Business",
    description: "For larger teams with reporting needs",
    monthlyPrice: 29,
    yearlyPrice: 24,
    features: [
      "Unlimited teammates",
      "Portfolio progress analytics",
      "Advanced permissions",
      "Custom fields and views",
      "API access",
      "Dedicated onboarding",
    ],
    cta: "Talk to us",
    popular: false,
    includesPrevious: "Everything in Team, plus",
  },
]

export function PricingSection() {
  const [isYearly, setIsYearly] = useState(false)

  return (
    <section id="pricing" className="py-24 sm:py-32 bg-muted/40">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mx-auto max-w-2xl text-center mb-12">
          <Badge variant="outline" className="mb-4">
            Pricing
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
            Simple pricing that scales with your team
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Start free, upgrade when your team needs shared boards, workload
            views and deadline tracking.
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center mb-2">
            <ToggleGroup
              value={[isYearly ? "yearly" : "monthly"]}
              onValueChange={(value) =>
                value[0] && setIsYearly(value[0] === "yearly")
              }
              className="bg-secondary text-secondary-foreground border-none rounded-full p-1 cursor-pointer shadow-none"
            >
              <ToggleGroupItem
                value="monthly"
                className="data-pressed:bg-background data-pressed:border-border border-transparent border px-6 rounded-full! data-pressed:text-foreground hover:bg-transparent cursor-pointer transition-colors"
              >
                Monthly
              </ToggleGroupItem>
              <ToggleGroupItem
                value="yearly"
                className="data-pressed:bg-background data-pressed:border-border border-transparent border px-6 rounded-full! data-pressed:text-foreground hover:bg-transparent cursor-pointer transition-colors"
              >
                Annually
              </ToggleGroupItem>
            </ToggleGroup>
          </div>

          <p className="text-sm text-muted-foreground">
            <span className="text-primary font-semibold">Save 25%</span> On
            Annual Billing
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="mx-auto max-w-6xl">
          <div className="rounded-xl border">
            <div className="grid lg:grid-cols-3">
              {plans.map((plan, index) => (
                <div
                  key={index}
                  className={cn(
                    "p-8 grid grid-rows-subgrid row-span-4 gap-6",
                    plan.popular
                      ? "my-2 mx-4 rounded-xl bg-card border-transparent shadow-xl ring-1 ring-foreground/10 backdrop-blur"
                      : ""
                  )}
                >
                  {/* Plan Header */}
                  <div>
                    <div className="flex items-center gap-2 text-lg font-medium tracking-tight mb-2">
                      {plan.name}
                      {plan.popular && (
                        <Badge variant="secondary">Most popular</Badge>
                      )}
                    </div>
                    <div className="text-muted-foreground text-balance text-sm">
                      {plan.description}
                    </div>
                  </div>

                  {/* Pricing */}
                  <div>
                    <div className="text-4xl font-bold mb-1 tabular-nums">
                      ${isYearly ? plan.yearlyPrice : plan.monthlyPrice}
                    </div>
                    <div className="text-muted-foreground text-sm">
                      {isYearly ? "per month, billed annually" : "per month"}
                    </div>
                  </div>

                  {/* CTA Button */}
                  <div>
                    <Button
                      className={cn(
                        "w-full cursor-pointer my-2",
                        plan.popular
                          ? "shadow-md border-[0.5px] border-primary-foreground/25 shadow-black/20 bg-primary ring-1 ring-primary/15 text-primary-foreground hover:bg-primary/90"
                          : "shadow-sm shadow-black/15 border border-transparent bg-background ring-1 ring-foreground/10 hover:bg-muted/50"
                      )}
                      variant={plan.popular ? "default" : "secondary"}
                      nativeButton={false}
                      render={<Link href="/sign-up" />}
                    >
                      {plan.cta}
                    </Button>
                  </div>

                  {/* Features */}
                  <div>
                    <ul role="list" className="flex flex-col gap-3 text-sm">
                      {plan.includesPrevious && (
                        <li className="flex items-center gap-3 font-medium">
                          {plan.includesPrevious}:
                        </li>
                      )}
                      {plan.features.map((feature, featureIndex) => (
                        <li
                          key={featureIndex}
                          className="flex items-center gap-3"
                        >
                          <Check
                            className="text-muted-foreground size-4 flex-shrink-0"
                            strokeWidth={2.5}
                          />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Enterprise Note */}
        <div className="mt-16 text-center">
          <p className="text-muted-foreground">
            Need on-prem hosting or a security review?{" "}
            <Button
              variant="link"
              className="p-0 h-auto cursor-pointer"
              nativeButton={false}
              render={<a href="#faq" />}
            >
              Read the FAQ
            </Button>
          </p>
        </div>
      </div>
    </section>
  )
}