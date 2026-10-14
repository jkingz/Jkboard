"use client"

import * as React from "react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { PricingPlans } from "@/components/pricing-plans"
import { CurrentPlanCard } from "./components/current-plan-card"
import { BillingHistoryCard } from "./components/billing-history-card"

// Import data
import currentPlanData from "./data/current-plan.json"
import billingHistoryData from "./data/billing-history.json"

export default function BillingSettings() {
  const [currentPlanId, setCurrentPlanId] = React.useState("starter")

  return (
    <div className="flex flex-col gap-6 px-4 lg:px-6">
      <div>
        <h1 className="text-3xl font-bold">Plans &amp; Billing</h1>
        <p className="text-muted-foreground">
          Manage your Jkboard subscription, invoices and payment details.
        </p>
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        <CurrentPlanCard plan={currentPlanData} />
        <BillingHistoryCard history={billingHistoryData} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Available plans</CardTitle>
          <CardDescription>
            Upgrade when your team needs shared boards, workload views and
            deadline tracking.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PricingPlans
            mode="billing"
            currentPlanId={currentPlanId}
            onPlanSelect={setCurrentPlanId}
          />
        </CardContent>
      </Card>
    </div>
  )
}