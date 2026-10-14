"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, LayoutDashboard, X, Moon, Sun } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Logo } from "@/components/logo"
import { ModeToggle } from "@/components/mode-toggle"
import { useTheme } from "@/hooks/use-theme"

const navigationItems = [
  { name: "Features", href: "#features" },
  { name: "Pricing", href: "#pricing" },
  { name: "FAQ", href: "#faq" },
]

// Smooth scroll function
const smoothScrollTo = (targetId: string) => {
  if (targetId.startsWith("#")) {
    const element = document.querySelector(targetId)
    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "start",
      })
    }
  }
}

export function LandingNavbar() {
  const [isOpen, setIsOpen] = useState(false)
  const { setTheme, theme } = useTheme()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
        {/* Logo */}
        <Link href="/landing" className="flex items-center gap-2 cursor-pointer">
          <Logo size={32} />
          <span className="text-lg font-bold tracking-tight">Jkboard</span>
        </Link>

        {/* Desktop Navigation */}
        <NavigationMenu className="hidden md:flex">
          <NavigationMenuList>
            {navigationItems.map((item) => (
              <NavigationMenuItem key={item.name}>
                <NavigationMenuLink
                  className="group inline-flex h-10 w-max items-center justify-center px-4 py-2 text-sm font-medium transition-colors hover:text-primary focus:text-primary focus:outline-none cursor-pointer"
                  onClick={(e: React.MouseEvent) => {
                    e.preventDefault()
                    smoothScrollTo(item.href)
                  }}
                >
                  {item.name}
                </NavigationMenuLink>
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-2">
          <ModeToggle variant="ghost" />
          <Button
            variant="outline"
            className="cursor-pointer"
            nativeButton={false}
            render={<Link href="/sign-in" />} // anonymous visitors are bounced off /dashboard by the proxy
          >
            <LayoutDashboard data-icon="inline-start" />
            Live Demo
          </Button>
          <Button
            variant="ghost"
            className="cursor-pointer"
            nativeButton={false}
            render={<Link href="/sign-in" />}
          >
            Sign In
          </Button>
          <Button
            className="cursor-pointer"
            nativeButton={false}
            render={<Link href="/sign-up" />}
          >
            Get Started
          </Button>
        </div>

        {/* Mobile Menu */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger
            className="md:hidden"
            render={
              <Button variant="ghost" size="icon" className="cursor-pointer" />
            }
          >
            <Menu className="size-5" data-icon="inline-start" />
            <span className="sr-only">Toggle menu</span>
          </SheetTrigger>
          <SheetContent
            side="right"
            showCloseButton={false}
            className="w-full sm:w-[400px] p-0 gap-0 overflow-hidden flex flex-col"
          >
            <div className="flex flex-col h-full">
              {/* Header */}
              <SheetHeader className="gap-0 p-4 pb-2 border-b">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Logo size={16} />
                  </div>
                  <SheetTitle className="text-lg font-semibold">
                    Jkboard
                  </SheetTitle>
                  <div className="ml-auto flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        setTheme(theme === "light" ? "dark" : "light")
                      }
                      className="cursor-pointer size-8"
                    >
                      <Moon
                        className="rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0"
                        data-icon="inline-start"
                      />
                      <Sun
                        className="absolute rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"
                        data-icon="inline-end"
                      />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setIsOpen(false)}
                      className="cursor-pointer size-8"
                    >
                      <X />
                    </Button>
                  </div>
                </div>
              </SheetHeader>

              {/* Navigation Links */}
              <div className="flex-1 overflow-y-auto">
                <nav className="flex flex-col p-6 gap-1">
                  {navigationItems.map((item) => (
                    <a
                      key={item.name}
                      href={item.href}
                      className="flex items-center px-4 py-3 text-base font-medium rounded-lg transition-colors hover:bg-accent hover:text-accent-foreground cursor-pointer"
                      onClick={(e) => {
                        e.preventDefault()
                        setIsOpen(false)
                        setTimeout(() => smoothScrollTo(item.href), 100)
                      }}
                    >
                      {item.name}
                    </a>
                  ))}
                </nav>
              </div>

              {/* Footer Actions */}
              <div className="flex flex-col border-t p-6 gap-4">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full cursor-pointer"
                  nativeButton={false}
                  render={<Link href="/sign-in" />} // anonymous visitors are bounced off /dashboard by the proxy
                >
                  <LayoutDashboard data-icon="inline-start" />
                  Live Demo
                </Button>

                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    size="lg"
                    className="cursor-pointer"
                    nativeButton={false}
                    render={<Link href="/sign-in" />}
                  >
                    Sign In
                  </Button>
                  <Button
                    size="lg"
                    className="cursor-pointer"
                    nativeButton={false}
                    render={<Link href="/sign-up" />}
                  >
                    Get Started
                  </Button>
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}