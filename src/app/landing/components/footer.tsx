"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import { z } from "zod"
import { Field, FieldError, FieldGroup } from "@/components/ui/field"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Logo } from "@/components/logo"
import { toast } from "@/components/ui/toast"

const newsletterSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
})

const footerLinks = {
  product: [
    { name: "Features", href: "#features" },
    { name: "Pricing", href: "#pricing" },
    { name: "FAQ", href: "#faq" },
    { name: "Live demo", href: "/dashboard" },
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
    { name: "Integrations", href: "/settings/connections" },
    { name: "Notifications", href: "/settings/notifications" },
  ],
}

export function LandingFooter() {
  const form = useForm<z.infer<typeof newsletterSchema>>({
    resolver: zodResolver(newsletterSchema),
    defaultValues: {
      email: "",
    },
  })

  function onSubmit(values: z.infer<typeof newsletterSchema>) {
    toast.promise(
      Promise.resolve(values.email),
      {
        loading: { title: "Subscribing…", description: "Saving your email." },
        success: {
          title: "You're on the list",
          description: "Product updates land in your inbox monthly.",
        },
        error: {
          title: "Something went wrong",
          description: "Please try again.",
        },
      }
    )
    form.reset()
  }

  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Newsletter Section */}
        <div className="mb-16">
          <div className="mx-auto max-w-2xl text-center">
            <h3 className="text-2xl font-bold mb-4">Stay in the loop</h3>
            <p className="text-muted-foreground mb-6">
              One email a month with new FlowBoard features, planning tips and
              deadline reminders. No spam, unsubscribe any time.
            </p>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="flex flex-col gap-2 max-w-md mx-auto sm:flex-row"
            >
              <FieldGroup>
                <Controller
                  control={form.control}
                  name="email"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid} className="flex-1">
                      <Input
                        id="footer-email"
                        aria-invalid={fieldState.invalid}
                        type="email"
                        placeholder="Enter your email"
                        {...field}
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </FieldGroup>
              <Button type="submit" className="cursor-pointer">
                Subscribe
              </Button>
            </form>
          </div>
        </div>

        {/* Main Footer Content */}
        <div className="grid gap-8 grid-cols-4 lg:grid-cols-6">
          {/* Brand Column */}
          <div className="col-span-4 lg:col-span-3 max-w-2xl">
            <div className="flex items-center gap-2 mb-4 max-lg:justify-center">
              <a
                href="/landing"
                className="flex items-center gap-2 cursor-pointer"
              >
                <Logo size={32} />
                <span className="font-bold text-xl">FlowBoard</span>
              </a>
            </div>
            <p className="text-muted-foreground mb-6 max-lg:text-center max-lg:flex max-lg:justify-center">
              Project and task management for individuals and small teams.
              Organize the work, track progress and catch deadlines before they
              slip.
            </p>
          </div>

          {/* Links Columns */}
          {(
            Object.entries(footerLinks) as [string, typeof footerLinks.product][]
          ).map(([group, links]) => (
            <div key={group} className="max-md:col-span-2 lg:col-span-1">
              <h4 className="font-semibold mb-4 capitalize">{group}</h4>
              <ul className="flex flex-col gap-3">
                {links.map((link) => (
                  <li key={link.name}>
                    <a
                      href={link.href}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <Separator className="my-8" />

        {/* Bottom Footer */}
        <div className="flex flex-col lg:flex-row justify-between items-center gap-2">
          <div className="flex flex-col sm:flex-row items-center gap-2 text-muted-foreground text-sm">
            <span>© {new Date().getFullYear()} FlowBoard</span>
            <span className="hidden sm:inline">•</span>
            <span>Plan the work. Ship on time.</span>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-4 md:mt-0">
            <a href="#faq" className="hover:text-foreground transition-colors">
              Privacy
            </a>
            <a href="#faq" className="hover:text-foreground transition-colors">
              Terms
            </a>
            <a
              href="/settings/connections"
              className="hover:text-foreground transition-colors"
            >
              Security
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}