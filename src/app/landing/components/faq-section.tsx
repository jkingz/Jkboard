"use client"

import { CircleHelp } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"

type FaqItem = {
  value: string
  question: string
  answer: string
}

const faqItems: FaqItem[] = [
  {
    value: "item-1",
    question: "How do I get started with FlowBoard?",
    answer:
      "Create an account, then start from a project template or a blank project. Add tasks, set a due date, and assign an owner. The overview page fills in automatically as your team logs work, so you can see progress without maintaining a separate report.",
  },
  {
    value: "item-2",
    question: "What is the difference between the Starter and Team plans?",
    answer:
      "Starter is built for individuals working solo and includes up to three active projects. Team unlocks unlimited projects, shared boards, workload views, the deadline calendar and guest collaborators. Both plans include unlimited tasks.",
  },
  {
    value: "item-3",
    question: "Can I move my existing work into FlowBoard?",
    answer:
      "Yes. Projects can be created in bulk from a spreadsheet, and tasks can be imported from the CSV export of most other trackers. Your historical completion data is preserved so progress reporting stays accurate from day one.",
  },
  {
    value: "item-4",
    question: "How do you handle overdue tasks and deadlines?",
    answer:
      "Any open task past its due date is flagged as overdue on the overview and highlighted in red in the task list. The deadline calendar shows the next two weeks at a glance, and the daily digest email lists everything due or overdue for you.",
  },
  {
    value: "item-5",
    question: "Does FlowBoard work for a team of two or three people?",
    answer:
      "That is exactly the range we optimise for. There is no per-seat tax on the Starter plan, and the Team plan covers up to ten teammates, which keeps small teams in a single workspace instead of paying for an enterprise tool they do not need.",
  },
  {
    value: "item-6",
    question: "Can I change or cancel my plan later?",
    answer:
      "Plans can be upgraded or downgraded at any time from the billing settings, and the change is prorated. Cancelling keeps your projects readable until the end of the billing period, and you can export everything beforehand.",
  },
]

const FaqSection = () => {
  return (
    <section id="faq" className="py-24 sm:py-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mx-auto max-w-2xl text-center mb-16">
          <Badge variant="outline" className="mb-4">
            FAQ
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-muted-foreground">
            Answers about plans, imports, deadlines and getting your team set
            up.
          </p>
        </div>

        {/* FAQ Content */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-transparent">
            <div className="p-0">
              <Accordion className="gap-5">
                {faqItems.map((item) => (
                  <AccordionItem
                    key={item.value}
                    value={item.value}
                    className="rounded-md border! bg-transparent"
                  >
                    <AccordionTrigger className="cursor-pointer items-center gap-4 rounded-none bg-transparent py-2 ps-3 pe-4 hover:no-underline data-panel-open:border-b">
                      <div className="flex items-center gap-4">
                        <div className="bg-primary/10 text-primary flex size-9 shrink-0 items-center justify-center rounded-full">
                          <CircleHelp className="size-5" />
                        </div>
                        <span className="text-start font-semibold">
                          {item.question}
                        </span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="p-4 bg-transparent">
                      {item.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>

          {/* Support CTA */}
          <div className="text-center mt-12">
            <p className="text-muted-foreground mb-4">
              Still have questions? Talk to the team.
            </p>
            <Button
              className="cursor-pointer"
              nativeButton={false}
              render={<a href="/sign-up" />}
            >
              Create a free account
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}

export { FaqSection }
