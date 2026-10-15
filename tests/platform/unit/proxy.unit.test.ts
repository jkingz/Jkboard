import { NextRequest } from "next/server"
import { describe, expect, it } from "vitest"

import { proxy, config } from "@/proxy"

/**
 * Invariant 5 from `docs/architecture.md`: **`proxy.ts` never redirects a
 * session-bearing request away from `/sign-in` / `/sign-up`.** Breaking it
 * produces the loop the file's own comment describes — `/sign-in` bounces to
 * `/dashboard`, the layout rejects the stale session, and both redirect each
 * other forever, which a visitor sees as a form that will not stay on screen.
 *
 * The proxy is an **optimistic** check: `getSessionCookie` reads presence, not
 * validity, because the proxy bundle cannot import the database. These tests
 * therefore assert presence-based behaviour, including the deliberate case that
 * a *bogus* cookie passes the proxy and is caught later by the layout.
 */

const ORIGIN = "http://localhost:3000"

/** Better Auth's default session cookie name — `better-auth` prefix + `session_token`. */
const SESSION_COOKIE = "better-auth.session_token=token-value"

function request(path: string, { session = false }: { session?: boolean } = {}) {
  return new NextRequest(new URL(path, ORIGIN), {
    headers: session ? { cookie: SESSION_COOKIE } : {},
  })
}

/** A redirect response, or `null` when the proxy let the request through. */
function locationOf(response: ReturnType<typeof proxy>) {
  const location = response.headers.get("location")
  return location ? new URL(location) : null
}

describe("invariant 5: the proxy never bounces a signed-in visitor off the forms", () => {
  it("a session-bearing request reaches /sign-in and /sign-up untouched", () => {
    for (const path of ["/sign-in", "/sign-up"]) {
      expect(locationOf(proxy(request(path, { session: true }))), path).toBeNull()
    }
  })

  it("the same paths still redirect when they are the legacy aliases", () => {
    // The aliases run before the session check, so /login is never a dead page —
    // and neither redirect can loop, because the target is not protected.
    expect(locationOf(proxy(request("/login")))?.pathname).toBe("/sign-in")
    expect(locationOf(proxy(request("/register")))?.pathname).toBe("/sign-up")
    expect(locationOf(proxy(request("/login", { session: true })))?.pathname).toBe("/sign-in")
  })

  it("an unauthenticated request to a protected route goes to /sign-in with a return path", () => {
    const cases: Array<[string, string]> = [
      ["/tasks", "/tasks"],
      ["/projects/2b812955-7d00-4d89-a2fc-d9f6a81e0030", "/projects/2b812955-7d00-4d89-a2fc-d9f6a81e0030"],
      ["/settings/account?tab=notifications", "/settings/account"],
      ["/users", "/users"],
    ]

    for (const [path, expected] of cases) {
      const location = locationOf(proxy(request(path)))
      expect(location?.pathname, path).toBe("/sign-in")
      expect(location?.searchParams.get("redirect")?.split("?")[0], path).toBe(expected)
    }
  })

  it("the bare dashboard destination carries no redirect parameter", () => {
    // /dashboard is where sign-in sends you anyway, so echoing it back would put
    // `?redirect=%2Fdashboard` on the form for no reason.
    const location = locationOf(proxy(request("/dashboard")))
    expect(location?.pathname).toBe("/sign-in")
    expect(location?.searchParams.get("redirect")).toBeNull()
  })

  it("a query string survives the redirect", () => {
    const location = locationOf(proxy(request("/tasks?status=todo&page=2")))
    expect(location?.searchParams.get("redirect")).toBe("/tasks?status=todo&page=2")
  })

  it("the check is presence-only, so a stale cookie passes and the layout rejects it", () => {
    const stale = new NextRequest(new URL("/tasks", ORIGIN), {
      headers: { cookie: "better-auth.session_token=not-a-real-session" },
    })

    expect(locationOf(proxy(stale))).toBeNull()
  })

  it("nothing is protected outside the declared prefixes", () => {
    for (const path of ["/", "/landing", "/errors/not-found", "/api/auth/get-session"]) {
      expect(locationOf(proxy(request(path))), path).toBeNull()
    }
  })

  it("the matcher excludes the internals a redirect would break", () => {
    expect(Array.isArray(config.matcher)).toBe(true)
    expect(config.matcher).toHaveLength(1)

    const pattern = config.matcher[0]
    // Written as a negative lookahead over the prefixes Next must not see.
    for (const excluded of ["api", "_next/static", "_next/image", "favicon.ico"]) {
      expect(pattern, excluded).toContain(excluded)
    }
  })
})
