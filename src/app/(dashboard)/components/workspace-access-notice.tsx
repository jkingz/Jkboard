"use client"

import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { PageStatus } from "@/components/page-status"
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
 * The alternative — falling back to the first member in the table — is a removed
 * bug, so the request stops here, visibly, rather than showing a
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
    <PageStatus
      code="403"
      title="This account needs workspace access"
      description={`You’re signed in as ${email}. Ask your workspace administrator to check this account’s access.`}
    >
      <Button onClick={signOut}>Sign out</Button>
    </PageStatus>
  )
}
