"use client"

import { useState } from "react"
import {
  CalendarClock,
  Check,
  Copy,
  GitBranch,
  KeyRound,
  MessageSquare,
  RefreshCw,
  Zap,
} from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { toast } from "@/components/ui/toast"
import { useFlowBoard } from "@/data/flowboard-store"

type IntegrationKey =
  | "googleCalendar"
  | "slack"
  | "github"
  | "zapier"

interface Integration {
  key: IntegrationKey
  name: string
  description: string
  icon: typeof Zap
}

const INTEGRATIONS: Integration[] = [
  {
    key: "googleCalendar",
    name: "Google Calendar",
    description: "Mirror every task deadline as a calendar event.",
    icon: CalendarClock,
  },
  {
    key: "slack",
    name: "Slack",
    description: "Post assignment and overdue alerts to a project channel.",
    icon: MessageSquare,
  },
  {
    key: "github",
    name: "GitHub",
    description: "Link commits and pull requests to the tasks they close.",
    icon: GitBranch,
  },
  {
    key: "zapier",
    name: "Zapier",
    description: "Trigger automations when a task changes status.",
    icon: Zap,
  },
]

const DEMO_KEYS = [
  { id: "live", label: "Production API key", value: "fb_live_8f42c1a97b3e4d5e" },
  { id: "test", label: "Development API key", value: "fb_test_2b7e9d04ca116f38" },
]

export default function IntegrationSettings() {
  const { currentMember } = useFlowBoard()
  const [connected, setConnected] = useState<Record<IntegrationKey, boolean>>({
    googleCalendar: true,
    slack: false,
    github: true,
    zapier: false,
  })
  const [keys, setKeys] = useState(DEMO_KEYS)
  const [revealed, setRevealed] = useState<string | null>(null)

  function toggle(key: IntegrationKey, name: string, next: boolean) {
    setConnected((prev) => ({ ...prev, [key]: next }))
    toast.add({
      type: next ? "success" : "info",
      title: next ? `${name} connected` : `${name} disconnected`,
      description: next
        ? "FlowBoard will start syncing as soon as OAuth is connected."
        : "FlowBoard will stop syncing with this service.",
    })
  }

  async function copyKey(label: string, value: string) {
    try {
      await navigator.clipboard.writeText(value)
      toast.add({
        type: "success",
        title: "API key copied",
        description: `${label} is on your clipboard.`,
      })
    } catch {
      toast.add({
        type: "error",
        title: "Could not copy",
        description: "Your browser blocked clipboard access.",
      })
    }
  }

  function regenerateKey(id: string, label: string) {
    const replacement = `fb_${id === "live" ? "live" : "test"}_${Math.random()
      .toString(16)
      .slice(2, 18)}`
    setKeys((prev) =>
      prev.map((key) => (key.id === id ? { ...key, value: replacement } : key))
    )
    setRevealed(null)
    toast.add({
      type: "warning",
      title: `${label} regenerated`,
      description: "Update any services still using the previous key.",
    })
  }

  return (
    <div className="flex flex-col gap-6 px-4 lg:px-6">
      <div>
        <h1 className="text-3xl font-bold">Integrations</h1>
        <p className="text-muted-foreground">
          Connect the tools your team already uses to keep projects and
          deadlines in sync.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Connected services</CardTitle>
          <CardDescription>
            Toggle a service to connect or disconnect it from the workspace
            owned by {currentMember.email}.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col">
            {INTEGRATIONS.map((integration, index) => {
              const isConnected = connected[integration.key]

              return (
                <div key={integration.key}>
                  {index > 0 && <Separator className="my-5" />}
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <integration.icon className="size-6 shrink-0 text-muted-foreground" />
                      <div>
                        <div className="flex items-center gap-2 font-medium">
                          {integration.name}
                          {isConnected && (
                            <Badge variant="outline" className="border-success/40 text-success">
                              <Check />
                              Connected
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {integration.description}
                        </div>
                      </div>
                    </div>
                    <Switch
                      className="cursor-pointer"
                      checked={isConnected}
                      aria-label={`Toggle ${integration.name}`}
                      onCheckedChange={(next) =>
                        toggle(integration.key, integration.name, next)
                      }
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>API keys</CardTitle>
          <CardDescription>
            Use these keys to read projects and tasks from your own tooling.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col">
          {keys.map((key, index) => (
            <div key={key.id}>
              {index > 0 && <Separator className="my-5" />}
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <div className="font-medium">{key.label}</div>
                  <div className="truncate font-mono text-sm text-muted-foreground">
                    {revealed === key.id
                      ? key.value
                      : `${key.value.slice(0, 10)}${"•".repeat(20)}${key.value.slice(-4)}`}
                  </div>
                </div>
                <div className="flex shrink-0 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="cursor-pointer"
                    onClick={() =>
                      setRevealed((prev) => (prev === key.id ? null : key.id))
                    }
                  >
                    {revealed === key.id ? "Hide" : "Reveal"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="cursor-pointer"
                    onClick={() => copyKey(key.label, key.value)}
                  >
                    <Copy data-icon="inline-start" />
                    Copy
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="cursor-pointer"
                    onClick={() => regenerateKey(key.id, key.label)}
                  >
                    <RefreshCw data-icon="inline-start" />
                    Regenerate
                  </Button>
                </div>
              </div>
            </div>
          ))}

          <Separator className="my-5" />

          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <KeyRound className="size-4" />
            Keys are mock values for this demo and are not sent anywhere.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}