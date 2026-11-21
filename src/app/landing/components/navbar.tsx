"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Logo } from "@/components/logo"
import { useSession } from "@/lib/auth-client"
import { DemoButton } from "./demo-button"

const navigationItems = [
  { name: "Workspace", href: "#workspace" },
  { name: "How it works", href: "#how-it-works" },
  { name: "FAQ", href: "#faq" },
]

/**
 * Two actions only: sign in, or one click into the demo. "Create an account"
 * lives in the hero and the closing band, so it is not repeated here.
 */
export function LandingNavbar() {
  const [isOpen, setIsOpen] = useState(false)
  // `undefined` while the session loads; only a definite session counts as signed in.
  const isSignedIn = useSession().data != null

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

        <div className="hidden items-center gap-2 md:flex">
          {!isSignedIn && (
            <Button variant="ghost" nativeButton={false} render={<Link href="/sign-in" />}>
              Sign in
            </Button>
          )}
          <DemoButton size="default" />
        </div>

        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger className="md:hidden" render={<Button variant="ghost" size="icon" />}>
            <Menu className="size-5" />
            <span className="sr-only">Open menu</span>
          </SheetTrigger>
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

            <div className="mt-auto flex flex-col gap-3 border-t p-6">
              <DemoButton className="w-full" />
              {!isSignedIn && (
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full"
                  nativeButton={false}
                  render={<Link href="/sign-in" />}
                >
                  Sign in
                </Button>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}
