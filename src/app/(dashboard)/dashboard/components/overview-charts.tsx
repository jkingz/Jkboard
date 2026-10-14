"use client"

import * as React from "react"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts"

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { useJkboard } from "@/data/jkboard-store"
import { taskCompletionTrend } from "@/data/jkboard"

const completionConfig = {
  completed: { label: "Completed", color: "var(--chart-1)" },
  created: { label: "Created", color: "var(--chart-3)" },
} satisfies ChartConfig

const progressConfig = {
  progress: { label: "Completion", color: "var(--chart-2)" },
} satisfies ChartConfig

export function TaskCompletionChart() {
  const [range, setRange] = React.useState("12w")
  const weeks = range === "12w" ? 12 : 4

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Task completion</CardTitle>
        <CardDescription>
          <span className="hidden @[540px]/card:block">
            Tasks completed against tasks created
          </span>
          <span className="@[540px]/card:hidden">Completed vs. created</span>
        </CardDescription>
        <CardAction>
          <ToggleGroup
            spacing={0}
            value={[range]}
            onValueChange={(value) => value[0] && setRange(value[0])}
            variant="outline"
            className="hidden *:data-[slot=toggle-group-item]:px-4! @[767px]/card:flex"
          >
            <ToggleGroupItem value="12w">12 weeks</ToggleGroupItem>
            <ToggleGroupItem value="4w">4 weeks</ToggleGroupItem>
          </ToggleGroup>
        </CardAction>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={completionConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <AreaChart data={taskCompletionTrend.slice(-weeks)}>
            <defs>
              <linearGradient
                id="fillCompleted"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="5%"
                  stopColor="var(--color-completed)"
                  stopOpacity={1}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-completed)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient
                id="fillCreated"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="5%"
                  stopColor="var(--color-created)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-created)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="week"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={24}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dot" />}
            />
            <Area
              dataKey="created"
              type="natural"
              fill="url(#fillCreated)"
              stroke="var(--color-created)"
            />
            <Area
              dataKey="completed"
              type="natural"
              fill="url(#fillCompleted)"
              stroke="var(--color-completed)"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

export function ProjectProgressChart() {
  const { projects, projectProgress } = useJkboard()

  const data = projects.map((project) => ({
    project: project.key,
    name: project.name,
    progress: projectProgress(project.id).progress,
  }))

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Project progress</CardTitle>
        <CardDescription>
          <span className="hidden @[540px]/card:block">
            Share of tasks completed in each project
          </span>
          <span className="@[540px]/card:hidden">Tasks completed</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={progressConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <BarChart data={data} layout="vertical" margin={{ left: 8 }}>
            <CartesianGrid horizontal={false} />
            <XAxis
              type="number"
              domain={[0, 100]}
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => `${value}%`}
            />
            <YAxis
              type="category"
              dataKey="project"
              tickLine={false}
              axisLine={false}
              width={48}
              tickMargin={8}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dot" />}
            />
            <Bar
              dataKey="progress"
              fill="var(--color-progress)"
              radius={6}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}