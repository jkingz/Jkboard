import Link from "next/link"

import { Logo } from "@/components/logo"

export function LandingFooter() {
  return (
    <footer className="border-t bg-background">
      <div className="landing-container flex flex-col gap-6 py-10 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link href="/landing" className="flex items-center gap-2">
            <Logo size={24} />
            <span className="text-[15px] font-semibold">Jkboard</span>
          </Link>
          <span className="text-[13px] text-muted-foreground">
            Project and task management for small teams.
          </span>
        </div>
        <nav aria-label="Footer" className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px] text-muted-foreground">
          <a href="#workspace" className="transition-colors hover:text-foreground">
            Workspace
          </a>
          <Link href="/sign-in" className="transition-colors hover:text-foreground">
            Sign in
          </Link>
          <Link href="/terms" className="transition-colors hover:text-foreground">Terms</Link>
          <Link href="/privacy" className="transition-colors hover:text-foreground">Privacy</Link>
          <span>&copy; {new Date().getFullYear()} Jkboard</span>
        </nav>
      </div>
    </footer>
  )
}
