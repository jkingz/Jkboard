"use client"

import { Check } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { toast } from "@/components/ui/toast"
import { cn } from "@/lib/utils"

export interface PricingPlan {
  id: string
  name: string
  description: string
  price: number
  period: string
  features: string[]
  popular?: boolean
}

export const flowboardPlans: PricingPlan[] = [
  {
    id: "starter",
    name: "Starter",
    description: "For individuals planning their own work.",
    price: 0,
    period: "forever",
    features: [
      "Up to 3 active projects",
      "Unlimited tasks",
      "Board and list views",
      "Due dates and reminders",
    ],
  },
  {
    id: "team",
    name: "Team",
    description: "For small teams shipping work together.",
    price: 12,
    period: "per user / month",
    features: [
      "Unlimited projects",
      "Up to 10 teammates",
      "Workload and progress views",
      "Deadline calendar",
      "Guest collaborators",
    ],
    popular: true,
  },
  {
    id: "business",
    name: "Business",
    description: "For larger teams with reporting needs.",
    price: 29,
    period: "per user / month",
    features: [
      "Unlimited teammates",
      "Portfolio progress analytics",
      "Advanced permissions",
      "Custom fields and views",
      "API access",
    ],
  },
]

interface PricingPlansProps {
  plans?: PricingPlan[]
  mode?: "pricing" | "billing"
  currentPlanId?: string
  onPlanSelect?: (planId: string) => void
}

export function PricingPlans({
  plans = flowboardPlans,
  mode = "pricing",
  currentPlanId,
  onPlanSelect,
}: PricingPlansProps) {
  function handleSelect(plan: PricingPlan) {
    if (mode === "billing" && plan.id === currentPlanId) {
      toast.promise(Promise.resolve(plan.name), {
        loading: {
          title: "Checking plan…",
          description: `${plan.name} is your current plan.`,
        },
        success: {
          title: `Already on ${plan.name}`,
          description: "No changes were made to your subscription.",
        },
        error: {
          title: "Something went wrong",
          description: "Please try again.",
        },
      })
      return
    }

    onPlanSelect?.(plan.id)
    toast.promise(Promise.resolve(plan.name), {
      loading: {
        title: "Updating plan…",
        description: `Switching you to ${plan.name}.`,
      },
      success: {
        title: `You are on ${plan.name}`,
        description: "Billing will be prorated on the next invoice.",
      },
      error: {
        title: "Something went wrong",
        description: "Please try again.",
      },
    })
  }

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {plans.map((plan) => {
        const isCurrent = plan.id === currentPlanId

        return (
          <Card
            key={plan.id}
            className={cn(
              "gap-0",
              plan.popular && "ring-2 ring-primary/60",
              isCurrent && "bg-muted/40"
            )}
          >
            <CardHeader>
              <div className="flex items-center gap-2">
                <CardTitle>{plan.name}</CardTitle>
                {plan.popular && (
                  <Badge variant="secondary">Most popular</Badge>
                )}
                {isCurrent && <Badge variant="outline">Current</Badge>}
              </div>
              <CardDescription>{plan.description}</CardDescription>
            </CardHeader>

            <CardContent>
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-bold tabular-nums">
                  ${plan.price}
                </span>
                <span className="text-sm text-muted-foreground">
                  {plan.period}
                </span>
              </div>

              <ul role="list" className="mt-4 flex flex-col gap-2.5 text-sm">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <Check
                      className="mt-0.5 size-4 shrink-0 text-success"
                      strokeWidth={2.5}
                    />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>

            <CardFooter>
              <Button
                variant={plan.popular ? "default" : "outline"}
                className="w-full cursor-pointer"
                onClick={() => handleSelect(plan)}
              >
                {mode === "billing"
                  ? isCurrent
                    ? "Current plan"
                    : `Switch to ${plan.name}`
                  : `Choose ${plan.name}`}
              </Button>
            </CardFooter>
          </Card>
        )
      })}
    </div>
  )
}