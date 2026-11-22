"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, X } from "lucide-react"

import { Button, buttonVariants } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Logo } from "@/components/logo"
import { ModeToggle } from "@/components/mode-toggle"

const navigationItems = [
  { name: "Workspace", href: "#workspace" },
  { name: "How it works", href: "#how-it-works" },
  { name: "FAQ", href: "#faq" },
]

export function LandingNavbar() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="landing-container flex h-16 items-center justify-between">
        <Link href="/landing" className="flex items-center gap-2">
          <Logo size={28} />
          <span className="text-[17px] font-semibold tracking-tight">Jkboard</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {navigationItems.map((item) => (
            <a
              key={item.name}
              href={item.href}
              className="text-[15px] font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {item.name}
            </a>
          ))}
        </nav>

        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <div className="flex items-center gap-2">
            <Link href="/sign-in" className={buttonVariants({ variant: "ghost" })}>
              Sign in
            </Link>
            <ModeToggle />
            <SheetTrigger className="md:hidden" render={<Button variant="ghost" size="icon" />}>
              <Menu className="size-5" />
              <span className="sr-only">Open menu</span>
            </SheetTrigger>
          </div>
          <SheetContent side="right" showCloseButton={false} className="landing w-full gap-0 p-0 sm:w-[400px]">
            <SheetHeader className="flex-row items-center justify-between border-b p-4">
              <SheetTitle className="flex items-center gap-2 text-[17px] font-semibold">
                <Logo size={24} />
                Jkboard
              </SheetTitle>
              <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                <X />
                <span className="sr-only">Close menu</span>
              </Button>
            </SheetHeader>

            <nav className="flex flex-col gap-1 p-6">
              {navigationItems.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className="rounded-md px-4 py-3 text-[17px] font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                  {item.name}
                </a>
              ))}
            </nav>

            <div className="mt-auto border-t p-6">
              <Link
                href="/sign-in"
                className={buttonVariants({ size: "lg", variant: "outline", className: "w-full" })}
              >
                Sign in
              </Link>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}
