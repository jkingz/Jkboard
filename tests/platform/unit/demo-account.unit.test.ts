import { NextRequest } from "next/server"
import { afterEach, describe, expect, it } from "vitest"

import {
  DEMO_ACCOUNTS,
  DEMO_EMAIL,
  DEMO_PASSWORD,
  DEMO_REDIRECT_TO,
  isDemoEnvironment,
} from "@/lib/demo"
import { proxy } from "@/proxy"

/**
 * `src/lib/demo.ts` holds credentials that are printed on a public landing page,
 * and `isDemoEnvironment()` is the only switch around them. Its body is
 * `process.env.NEXT_PUBLIC_DEMO_MODE !== "false"` — a comparison, not a truth
 * test — so the switch is only off when it is spelled exactly right.
 *
 * That is worth pinning: `NEXT_PUBLIC_DEMO_MODE=0` is what anyone would write to
 * turn it off, and today it leaves demo access on with no signal anywhere.
 * This tier cannot reach a browser, so the env var is set and restored directly
 * rather than read from `.env.local`, which the unit tier never loads.
 */

const KEY = "NEXT_PUBLIC_DEMO_MODE"

afterEach(() => {
  delete process.env[KEY]
})

describe("isDemoEnvironment", () => {
  it("is on unless the variable says otherwise, including when it is absent", () => {
    delete process.env[KEY]
    expect(isDemoEnvironment()).toBe(true)

    process.env[KEY] = ""
    expect(isDemoEnvironment()).toBe(true)
  })

  it("is off only for the exact lowercase string false", () => {
    process.env[KEY] = "false"
    expect(isDemoEnvironment()).toBe(false)
  })

  it("stays on for every other way of saying no — the footgun, recorded", () => {
    // Deleting this test is how you decide to make the switch a real boolean
    // parse instead of a string comparison.
    for (const value of ["0", "FALSE", "False", "no", "off"]) {
      process.env[KEY] = value
      expect(isDemoEnvironment(), value).toBe(true)
    }
  })
})

describe("the demo account block", () => {
  it("names one account, and the headline credentials are that account", () => {
    const emails = DEMO_ACCOUNTS.map((account) => account.email)

    expect(new Set(emails).size).toBe(emails.length)
    expect(emails).toContain(DEMO_EMAIL)
    expect(DEMO_ACCOUNTS.find((account) => account.email === DEMO_EMAIL)).toMatchObject({
      name: expect.any(String),
      role: expect.any(String),
    })
  })

  it("carries credentials that are actually usable as a form prefill", () => {
    expect(DEMO_EMAIL).toContain("@")
    expect(DEMO_PASSWORD.length).toBeGreaterThan(7)
  })

  it("sends the visitor to a route the proxy protects, and never bounces them off the form", () => {
    // The demo flow is `/sign-in` → `DEMO_REDIRECT_TO`. If that destination were
    // not protected the post-sign-in redirect would be a no-op; if the form were
    // bounced once a cookie existed, it would be invariant 5's infinite loop.
    expect(DEMO_REDIRECT_TO).toBe("/dashboard")

    const anonymous = proxy(new NextRequest(`http://localhost:3000${DEMO_REDIRECT_TO}`))
    expect(anonymous.headers.get("location")).toContain("/sign-in")

    const signedIn = proxy(
      new NextRequest(new URL("/sign-in", "http://localhost:3000"), {
        headers: { cookie: "better-auth.session_token=token-value" },
      })
    )
    expect(signedIn.headers.get("location")).toBeNull()
  })
})
