import Link from "next/link"

import { Logo } from "@/components/logo"

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="landing min-h-svh bg-background text-foreground">
      <header className="border-b bg-card">
        <nav aria-label="Legal pages" className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-4 px-5 py-4 sm:px-8">
          <Link href="/landing" className="flex items-center gap-2 font-semibold">
            <Logo size={24} />
            Jkboard
          </Link>
          <div className="flex gap-4 text-sm text-muted-foreground">
            <Link href="/terms" className="hover:underline">Terms of Service</Link>
            <Link href="/privacy" className="hover:underline">Privacy Policy</Link>
          </div>
        </nav>
      </header>
      <main className="mx-auto max-w-4xl px-5 py-10 sm:px-8 sm:py-14">
        <article className="flex max-w-2xl flex-col gap-6 [&_h1]:text-3xl [&_h1]:font-semibold [&_h2]:mb-2 [&_h2]:text-lg [&_h2]:font-semibold [&_p]:leading-relaxed [&_p]:text-muted-foreground">
          {children}
        </article>
      </main>
    </div>
  )
}
