"use client"

import Link from "next/link"
import { CircleHelp } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Reveal } from "@/components/reveal"

/**
 * Questions this product's users actually have.
 *
 * DESIGN.md → Honesty constraints: no feature may be described here unless it
 * exists. The previous version promised bulk CSV import, project templates, a
 * daily digest email, and plan cancellation from billing settings. None of those
 * are built, and there is no payment provider wired up at all.
 */
const faqItems = [
  {
    value: "demo",
    question: "Can I look at it before making an account?",
    answer:
      "Yes. Every page on this site is built from the same components as the app, and the demo credentials on the sign-in page open a seeded workspace with real projects, tasks and teammates. Nothing is mocked in the demo, which is also the fastest way to tell whether it suits you.",
  },
  {
    value: "workspace",
    question: "Is my team's work private?",
    answer:
      "The demo account is shared with every other visitor, so treat anything you do in it as temporary. For your own work, sign up with your email: each account gets its own workspace and the database holds it under your user id.",
  },
  {
    value: "moving",
    question: "Can I move work in from another tracker?",
    answer:
      "Not yet. There is no import. You can create projects and tasks by hand, or use the demo workspace to see how the data model is shaped before you commit to entering your own work.",
  },
  {
    value: "deadlines",
    question: "How does it decide a task is overdue?",
    answer:
      "A task counts as overdue when it is unfinished and its due date has passed in UTC. Due dates are calendar dates rather than timestamps, so a task is never overdue because of the timezone it is viewed from.",
  },
  {
    value: "colleagues",
    question: "How do I add the rest of my team?",
    answer:
      "The team page invites people by email address, which creates an account for them with no password yet. They claim it by signing in with that address. Everyone shares one workspace rather than getting separate projects.",
  },
  {
    value: "billing",
    question: "Is there a paid plan?",
    answer:
      "No. There is no billing and no payment details are collected, so there is nothing to pay and nothing to cancel.",
  },
]

const FaqSection = () => {
  return (
    <section id="faq" className="py-20 sm:py-28">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="mx-auto max-w-2xl">
            <h2 className="mb-4 text-3xl font-semibold tracking-tight sm:text-4xl">
              Questions worth answering first
            </h2>
            <p className="text-lg text-muted-foreground text-pretty">
              Including the things it does not do yet.
            </p>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="mx-auto mt-12 max-w-3xl">
            <Accordion className="gap-2">
              {faqItems.map((item) => (
                <AccordionItem
                  key={item.value}
                  value={item.value}
                  className="border-b bg-transparent last:border-b-0"
                >
                  <AccordionTrigger className="cursor-pointer gap-4 rounded-none bg-transparent py-5 hover:no-underline">
                    <CircleHelp
                      className="size-4 shrink-0 text-muted-foreground"
                      aria-hidden="true"
                    />
                    <span className="text-start font-medium">
                      {item.question}
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="ps-8 text-muted-foreground">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </Reveal>

        <Reveal delay={0.15}>
          <div className="mt-12 text-center">
            <Button
              className="cursor-pointer"
              nativeButton={false}
              render={<Link href="/sign-in" />}
            >
              Open the demo workspace
            </Button>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

export { FaqSection }