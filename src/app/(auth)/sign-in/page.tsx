import Link from "next/link"

import { Logo } from "@/components/logo"
import { LoginForm } from "./components/login-form"

export const metadata = {
  title: "Sign in - Jkboard",
  description: "Sign in to your Jkboard account",
}

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string | string[] }>
}) {
  const { redirect } = await searchParams
  const base = "https://jkboard.invalid"
  const next = typeof redirect === "string" && redirect.startsWith("/") && !redirect.startsWith("//")
    ? URL.parse(redirect, base)
    : null
  const target = next?.origin === base && !next.pathname.startsWith("//")
    ? `${next.pathname}${next.search}${next.hash}`
    : "/dashboard"

  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <Link
          href="/"
          className="flex items-center gap-2 self-center font-medium"
        >
          <div className="bg-primary text-primary-foreground flex size-9 items-center justify-center rounded-md">
            <Logo size={24} />
          </div>
          Jkboard
        </Link>
        <LoginForm redirectTo={target} />
      </div>
    </div>
  )
}