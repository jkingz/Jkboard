"use client"

import Link from "next/link"

import { Button } from "@/components/ui/button"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Reveal } from "@/components/reveal"
import { DemoButton } from "./demo-button"

/**
 * Closing band and FAQ from the teal Paper board. Answers only describe what is
 * built (docs/ui.md → Honesty constraints).
 */
const faqItems = [
  {
    value: "demo",
    question: "Can I try it before creating an account?",
    answer: "Yes. Open the live demo and you are signed in to the shared workspace.",
  },
  {
    value: "visibility",
    question: "Who can see work in the demo?",
    answer:
      "Every visitor. Permissions are not enforced yet, so anyone signed in to the demo can change or delete what is in there. Treat it as a scratch pad.",
  },
  {
    value: "cost",
    question: "How much does Jkboard cost?",
    answer: "Nothing. There is no paid plan and no billing at all.",
  },
  {
    value: "workspace",
    question: "Can I create a separate workspace?",
    answer:
      "Yes. Create an account and it gets its own workspace, visible only to the accounts in it.",
  },
]

export function CTASection() {
  return (
    <section id="faq" className="landing-band landing-invert py-18 lg:py-24">
      <div className="landing-container grid gap-12 lg:grid-cols-2 lg:gap-18">
        <Reveal>
          <h2 className="landing-heading">Take the board for a spin.</h2>
          <p className="mt-6 max-w-md text-lg/[25px] text-muted-foreground text-pretty">
            Open the shared demo to explore projects, move a task, and see how
            deadlines show up.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <DemoButton />
            <Button size="lg" variant="outline" nativeButton={false} render={<Link href="/sign-up" />}>
              Create an account
            </Button>
          </div>
        </Reveal>

        <Reveal delay={0.05}>
          <h3 className="text-2xl/[30px] font-semibold">Before you start</h3>
          <Accordion className="mt-4">
            {faqItems.map((item) => (
              <AccordionItem key={item.value} value={item.value} className="border-b">
                <AccordionTrigger className="cursor-pointer py-4 text-[15px] font-semibold hover:no-underline">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="text-[15px] text-muted-foreground">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Reveal>
      </div>
    </section>
  )
}
