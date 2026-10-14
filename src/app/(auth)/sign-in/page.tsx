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
  searchParams: Promise<{ redirect?: string }>
}) {
  const { redirect } = await searchParams

  /**
   * Only same-origin paths are honoured, so this value can never be used as an
   * open redirect to another site.
   */
  const target =
    redirect && redirect.startsWith("/") && !redirect.startsWith("//")
      ? redirect
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