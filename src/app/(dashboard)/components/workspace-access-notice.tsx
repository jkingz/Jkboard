"use client"

import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { authClient } from "@/lib/auth-client"

/**
 * Shown instead of the dashboard when a signed-in account has no `member` row.
 *
 * Sign-up normally creates both rows at once (`src/lib/auth.ts:76`), so getting
 * here means the membership is missing while the account is not — a record lost
 * to a hand-inserted `user` or to a database predating that hook.
 *
 * The dashboard cannot render without a membership: `currentMember` is what names
 * the caller and owns whatever they create, and every action throws without it.
 * The alternative — falling back to the first member in the table — is the bug
 * `specs/01` removes, so the request stops here, visibly, rather than showing a
 * workspace that belongs to someone else.
 */
export function WorkspaceAccessNotice({ email }: { email: string }) {
  const router = useRouter()

  async function signOut() {
    const { error } = await authClient.signOut()

    if (error) {
      router.replace("/sign-in")
      return
    }

    router.replace("/landing")
    router.refresh()
  }

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col items-center justify-center gap-6 p-8 text-center">
      <div className="flex flex-col gap-3">
        <h1 className="text-2xl font-semibold">No workspace membership</h1>
        <p className="text-sm text-muted-foreground">
          You are signed in as {email}, but this account has no membership
          record, so there is no workspace to show and every action is refused.
          Someone with database access has to create the membership row before
          this address can use Jkboard.
        </p>
      </div>
      <Button variant="outline" onClick={signOut}>
        Sign out
      </Button>
    </div>
  )
}
