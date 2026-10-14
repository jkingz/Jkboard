import Link from "next/link"

import { Logo } from "@/components/logo"
import { SignupForm } from "./components/signup-form"

export const metadata = {
  title: "Create account - FlowBoard",
  description: "Create your FlowBoard account",
}

export default async function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>
}) {
  const { redirect } = await searchParams

  /** Same-origin paths only — never an absolute URL. */
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
          FlowBoard
        </Link>
        <SignupForm redirectTo={target} />
      </div>
    </div>
  )
}