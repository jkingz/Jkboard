/**
 * Demo access.
 *
 * The credentials below are printed on the landing page and the sign-in form
 * so a visitor can reach a working dashboard without creating an account. They
 * are public by design — which makes them the weakest possible secret and the
 * most important one to scope carefully. See `docs/project-context.md` →
 * Demo access before changing anything here.
 *
 * The account is created by `pnpm db:seed` and `pnpm db:seed:auth`, which
 * create the workspace rows and the credential hashes respectively.
 */

/** Shown on the sign-in form as a pre-filled, one-click demo. */
export const DEMO_EMAIL = "maya.chen@jkboard.app"

/** Public by design. Anyone reading the page has it. */
export const DEMO_PASSWORD = "jkboard-2026"

/** Where the sign-in form sends a demo visitor. */
export const DEMO_REDIRECT_TO = "/dashboard"

/**
 * The other seeded teammates share the same password. Listing them lets a
 * visitor see the team and workload views populated from different angles.
 */
export const DEMO_ACCOUNTS = [
  { email: DEMO_EMAIL, name: "Maya Chen", role: "Product Lead" },
  { email: "daniel.okafor@jkboard.app", name: "Daniel Okafor", role: "Engineering Lead" },
  { email: "priya.raman@jkboard.app", name: "Priya Raman", role: "Design Lead" },
] as const

/** True for a real `.env.local`, false when the file is absent or unseeded. */
export function isDemoEnvironment() {
  return process.env.NEXT_PUBLIC_DEMO_MODE !== "false"
}