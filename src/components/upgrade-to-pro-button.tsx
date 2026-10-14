"use client"

import Link from "next/link"
import { Rocket, Users, ArrowRight, Gauge } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  HoverCard,
  HoverCardTrigger,
  HoverCardContent,
} from "@/components/ui/hover-card"

const TEAM_PLAN_FEATURES = [
  {
    icon: Users,
    title: "Unlimited projects",
    description: "Stop archiving work to stay under a cap.",
  },
  {
    icon: Gauge,
    title: "Workload and progress views",
    description: "See per-project completion and per-person load.",
  },
  {
    icon: ArrowRight,
    title: "Deadline calendar",
    description: "Every due date in one two-week view.",
  },
]

export function UpgradeToProButton() {
  return (
    <div className="fixed z-50 bottom-8 right-4 md:right-6 lg:right-8 flex flex-col items-end gap-2">
      <HoverCard>
        <HoverCardTrigger
          delay={100}
          closeDelay={100}
          render={
            <Button
              size="lg"
              className="px-6 py-3 bg-gradient-to-br shadow-lg from-slate-900 cursor-pointer to-slate-400 text-white font-bold"
              style={{ minWidth: 180 }}
              nativeButton={false}
              render={<Link href="/settings/billing" />}
            />
          }
        >
          Explore Team plan
          <Rocket size={30} data-icon="inline-end" />
        </HoverCardTrigger>
        <HoverCardContent className="mb-3 w-90 rounded-xl shadow-2xl bg-background border border-border p-4 animate-in fade-in slide-in-from-bottom-4 relative mr-4 md:mr-6 lg:mr-8">
          <div className="flex flex-col gap-3">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <Rocket size={18} className="text-primary" />
              Move your team to FlowBoard Team
            </h3>
            <p className="text-muted-foreground text-sm">
              You are on the Starter plan. Upgrade when the team needs shared
              boards and deadline tracking.
            </p>
            <ul className="flex flex-col gap-2.5">
              {TEAM_PLAN_FEATURES.map((feature) => (
                <li key={feature.title} className="flex items-start gap-2.5">
                  <feature.icon className="mt-0.5 size-4 shrink-0 text-primary" />
                  <span className="text-sm">
                    <span className="font-medium">{feature.title}</span>{" "}
                    <span className="text-muted-foreground">
                      {feature.description}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
            <Button
              className="w-full cursor-pointer"
              variant="default"
              nativeButton={false}
              render={<Link href="/settings/billing" />}
            >
              Compare plans
              <ArrowRight data-icon="inline-end" />
            </Button>
          </div>
        </HoverCardContent>
      </HoverCard>
    </div>
  )
}