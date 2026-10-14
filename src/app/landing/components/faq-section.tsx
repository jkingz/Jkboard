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
 * Questions worth answering early, which is when a product is unfinished.
 *
 * DESIGN.md -> Honesty constraints: no feature may be described here unless it
 * exists. The previous version promised bulk CSV import, project templates, a
 * daily digest email, and plan cancellation from billing settings. None of those
 * are built, and there is no payment provider wired up at all.
 *
 * The questions a visitor actually has changes once a product is early: not
 * "which plan do I need" but "is this safe to try", "what breaks", and "what
 * happens to my data". Those are answered first here.
 */
const faqItems = [
  {
    value: "stage",
    question: "How finished is this?",
    answer:
      "Early. The parts described on this page all work end to end: projects, tasks, boards, the task table, the calendar, workload and progress. What is missing is anything around them. There is no import from other tools, no roles or permissions, and no billing. Nothing on this page describes a feature that does not exist, and this page changes when that stops being true.",
  },
  {
    value: "demo",
    question: "Can I look at it before making an account?",
    answer:
      "Yes, and you should. The demo credentials at the top of this page open a seeded workspace with six projects, thirty six tasks and eight teammates. Every screen is the real interface, not a screenshot, so clicking through it tells you more in a minute than any description could.",
  },
  {
    value: "safe",
    question: "Is it safe to try the shared demo?",
    answer:
      "Treat it as a scratch pad. The demo workspace is visible to every visitor, and permissions are not enforced yet, so anyone signed in can change or delete what is in there. That includes you. Nothing important should go into it. If you want a space that is yours, create an account instead: it gets its own workspace.",
  },
  {
    value: "mydata",
    question: "What happens if you change your mind later?",
    answer:
      "There is no paid plan to be locked into, because there is no billing at all. Your account and its workspace stay readable. You would delete your own account to leave, though that button is not built yet.",
  },
  {
    value: "privacy",
    question: "Who can see my workspace?",
    answer:
      "Only signed-in accounts in it. There is one workspace per account, and the database holds it against your user id. The exception is the shared demo, which is deliberately public and where nobody's private work belongs.",
  },
  {
    value: "deadlines",
    question: "How does it decide a task is overdue?",
    answer:
      "A task counts as overdue when it is unfinished and its due date has passed in UTC. Due dates are calendar dates rather than timestamps, so a task is never late because of the timezone you happen to be in.",
  },
  {
    value: "colleagues",
    question: "How do I add the rest of my team?",
    answer:
      "The team page invites people by email address, which creates an account for them without a password. They claim it by signing in with that address. Everyone shares one workspace rather than getting separate spaces.",
  },
  {
    value: "moving",
    question: "Can I move work in from another tracker?",
    answer:
      "Not yet. Creating projects and tasks by hand works today, and the demo workspace is a decent way to see how the data is shaped before you enter anything real. Bulk import is on the list but is not built.",
  },
]

const FaqSection = () => {
  return (
    <section id="faq" className="py-20 sm:py-28">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="mx-auto max-w-2xl">
            <h2 className="mb-4 text-3xl font-semibold tracking-tight sm:text-4xl">
              Worth knowing before you start
            </h2>
            <p className="text-lg text-muted-foreground text-pretty">
              Jkboard is early, so these are the things worth asking rather
              than the things a finished product would list.
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
          <div className="mt-12 flex flex-col items-center gap-3 text-center">
            <p className="text-muted-foreground text-pretty">
              The fastest way to judge it is to break it a little.
            </p>
            <Button
              className="cursor-pointer"
              nativeButton={false}
              render={<Link href="/sign-in" />}
            >
              Explore the shared demo
            </Button>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

export { FaqSection }