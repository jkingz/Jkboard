"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import { z } from "zod"
import { BellRing } from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { toast } from "@/components/ui/toast"

const CHANNELS = [
  { key: "email", label: "Email" },
  { key: "inApp", label: "In-app" },
  { key: "push", label: "Push" },
] as const

type ChannelKey = (typeof CHANNELS)[number]["key"]

const EVENTS = [
  {
    key: "taskAssigned",
    label: "Task assigned to me",
    description: "Someone assigns you a task or reassigns work you own.",
  },
  {
    key: "taskMentioned",
    label: "Mentioned in a comment",
    description: "A teammate @-mentions you on a task.",
  },
  {
    key: "dueSoon",
    label: "Deadline approaching",
    description: "A task you own is due within 48 hours.",
  },
  {
    key: "overdue",
    label: "Task overdue",
    description: "A task you own passes its due date.",
  },
  {
    key: "projectUpdate",
    label: "Project changes",
    description: "Scope, status or due dates change on a project you follow.",
  },
  {
    key: "weeklyDigest",
    label: "Weekly progress digest",
    description: "A Monday summary of team completion and upcoming work.",
  },
] as const

type EventKey = (typeof EVENTS)[number]["key"]

type MatrixValue = Record<ChannelKey, boolean>

const notificationsFormSchema = z.object({
  matrix: z.record(z.string(), z.object({
    email: z.boolean(),
    inApp: z.boolean(),
    push: z.boolean(),
  })),
  digestFrequency: z.enum(["instant", "daily", "weekly"]),
  quietHoursStart: z.string(),
  quietHoursEnd: z.string(),
  quietHoursEnabled: z.boolean(),
  productNews: z.boolean(),
})

type NotificationsFormValues = z.infer<typeof notificationsFormSchema>

function buildDefaultMatrix(): Record<EventKey, MatrixValue> {
  const defaults: Record<EventKey, MatrixValue> = {
    taskAssigned: { email: true, inApp: true, push: true },
    taskMentioned: { email: true, inApp: true, push: false },
    dueSoon: { email: true, inApp: true, push: true },
    overdue: { email: true, inApp: true, push: true },
    projectUpdate: { email: false, inApp: true, push: false },
    weeklyDigest: { email: true, inApp: false, push: false },
  }

  return defaults
}

const HOURS = [
  { value: "06:00", label: "6:00 AM" },
  { value: "07:00", label: "7:00 AM" },
  { value: "08:00", label: "8:00 AM" },
  { value: "18:00", label: "6:00 PM" },
  { value: "19:00", label: "7:00 PM" },
  { value: "20:00", label: "8:00 PM" },
  { value: "21:00", label: "9:00 PM" },
  { value: "22:00", label: "10:00 PM" },
  { value: "23:00", label: "11:00 PM" },
]

export default function NotificationSettings() {
  const form = useForm<NotificationsFormValues>({
    resolver: zodResolver(notificationsFormSchema),
    defaultValues: {
      matrix: buildDefaultMatrix() as unknown as NotificationsFormValues["matrix"],
      digestFrequency: "daily",
      quietHoursStart: "22:00",
      quietHoursEnd: "06:00",
      quietHoursEnabled: true,
      productNews: false,
    },
  })
  const [permission, setPermission] = useState<NotificationPermission | "unsupported">(
    typeof Notification === "undefined" ? "unsupported" : Notification.permission
  )

  function onSubmit() {
    toast.add({
      type: "success",
      title: "Notification preferences saved",
      description: "FlowBoard will use these channels from now on.",
    })
  }

  async function requestPermission() {
    if (typeof Notification === "undefined") {
      toast.add({
        type: "error",
        title: "Not supported",
        description: "This browser cannot show push notifications.",
      })
      return
    }

    const result = await Notification.requestPermission()
    setPermission(result)
    toast.add({
      type: result === "granted" ? "success" : "info",
      title:
        result === "granted"
          ? "Browser notifications enabled"
          : "Browser notifications not enabled",
      description:
        result === "granted"
          ? "FlowBoard can now notify you outside the tab."
          : "You can change this later in your browser settings.",
    })
  }

  return (
    <div className="flex flex-col gap-6 px-4 lg:px-6">
      <div>
        <h1 className="text-3xl font-bold">Notifications</h1>
        <p className="text-muted-foreground">
          Choose which events reach you, and on which channels.
        </p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Delivery matrix</CardTitle>
            <CardDescription>
              Pick a channel for each event. Anything unchecked is never sent.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Event</TableHead>
                  {CHANNELS.map((channel) => (
                    <TableHead key={channel.key} className="text-center">
                      {channel.label}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {EVENTS.map((event) => (
                  <TableRow key={event.key}>
                    <TableCell>
                      <div className="max-w-sm">
                        <div className="font-medium">{event.label}</div>
                        <div className="text-sm text-muted-foreground">
                          {event.description}
                        </div>
                      </div>
                    </TableCell>
                    {CHANNELS.map((channel) => (
                      <TableCell key={channel.key} className="text-center">
                        <Controller
                          control={form.control}
                          name={`matrix.${event.key}.${channel.key}` as const}
                          render={({ field }) => (
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              aria-label={`${event.label}: ${channel.label}`}
                              className="cursor-pointer"
                            />
                          )}
                        />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Delivery &amp; quiet hours</CardTitle>
              <CardDescription>
                Batch non-urgent notifications, and hold everything else
                overnight.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FieldGroup>
                <Controller
                  control={form.control}
                  name="digestFrequency"
                  render={({ field }) => (
                    <Field>
                      <FieldLabel htmlFor="digest-frequency">
                        Non-urgent digest
                      </FieldLabel>
                      <Select
                        items={[
                          { value: "instant", label: "Send instantly" },
                          { value: "daily", label: "Once a day" },
                          { value: "weekly", label: "Once a week" },
                        ]}
                        value={field.value}
                        onValueChange={(value) =>
                          value && field.onChange(value)
                        }
                      >
                        <SelectTrigger
                          id="digest-frequency"
                          className="w-full cursor-pointer"
                        >
                          <SelectValue placeholder="Select frequency" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectItem value="instant">
                              Send instantly
                            </SelectItem>
                            <SelectItem value="daily">Once a day</SelectItem>
                            <SelectItem value="weekly">
                              Once a week
                            </SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </Field>
                  )}
                />

                <Controller
                  control={form.control}
                  name="quietHoursEnabled"
                  render={({ field }) => (
                    <Field orientation="horizontal">
                      <Checkbox
                        id="quiet-hours-enabled"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="cursor-pointer"
                      />
                      <FieldContent>
                        <FieldLabel htmlFor="quiet-hours-enabled">
                          Enable quiet hours
                        </FieldLabel>
                        <FieldDescription>
                          Hold non-urgent notifications between these times.
                        </FieldDescription>
                      </FieldContent>
                    </Field>
                  )}
                />

                <Controller
                  control={form.control}
                  name="quietHoursStart"
                  render={({ field }) => (
                    <Field className="@container/field">
                      <FieldLabel htmlFor="quiet-hours-start">From</FieldLabel>
                      <div className="flex items-center gap-2">
                        <Select
                          items={HOURS}
                          value={field.value}
                          onValueChange={(value) => value && field.onChange(value)}
                        >
                          <SelectTrigger
                            id="quiet-hours-start"
                            className="w-full cursor-pointer @[220px]/field:w-32"
                          >
                            <SelectValue placeholder="Start" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              {HOURS.map((hour) => (
                                <SelectItem key={hour.value} value={hour.value}>
                                  {hour.label}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                        <span className="text-sm text-muted-foreground">to</span>
                        <Controller
                          control={form.control}
                          name="quietHoursEnd"
                          render={({ field: endField }) => (
                            <Select
                              items={HOURS}
                              value={endField.value}
                              onValueChange={(value) =>
                                value && endField.onChange(value)
                              }
                            >
                              <SelectTrigger className="w-full cursor-pointer @[220px]/field:w-32">
                                <SelectValue placeholder="End" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectGroup>
                                  {HOURS.map((hour) => (
                                    <SelectItem
                                      key={hour.value}
                                      value={hour.value}
                                    >
                                      {hour.label}
                                    </SelectItem>
                                  ))}
                                </SelectGroup>
                              </SelectContent>
                            </Select>
                          )}
                        />
                      </div>
                    </Field>
                  )}
                />
              </FieldGroup>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Browser notifications</CardTitle>
              <CardDescription>
                {permission === "granted"
                  ? "Permission granted — FlowBoard can notify you outside this tab."
                  : permission === "denied"
                    ? "Permission blocked. Re-enable it in your browser settings."
                    : permission === "unsupported"
                      ? "This browser does not support the Notifications API."
                      : "FlowBoard needs permission before it can notify you outside this tab."}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <Button
                type="button"
                variant="outline"
                className="w-fit cursor-pointer"
                disabled={permission !== "default"}
                onClick={requestPermission}
              >
                <BellRing data-icon="inline-start" />
                {permission === "granted"
                  ? "Permission granted"
                  : permission === "denied"
                    ? "Permission blocked"
                    : "Request permission"}
              </Button>
              <Separator />
              <Controller
                control={form.control}
                name="productNews"
                render={({ field }) => (
                  <Field orientation="horizontal">
                    <Checkbox
                      id="product-news"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      className="cursor-pointer"
                    />
                    <FieldContent>
                      <FieldLabel htmlFor="product-news">
                        Product news and tips
                      </FieldLabel>
                      <FieldDescription>
                        Occasional emails about new FlowBoard features. No
                        upsells.
                      </FieldDescription>
                    </FieldContent>
                  </Field>
                )}
              />
            </CardContent>
          </Card>
        </div>

        <div className="flex gap-2">
          <Button type="submit" className="cursor-pointer">
            Save preferences
          </Button>
          <Button
            variant="outline"
            type="reset"
            className="cursor-pointer"
            onClick={() => form.reset()}
          >
            Reset to defaults
          </Button>
        </div>
      </form>
    </div>
  )
}
