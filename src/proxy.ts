import { NextResponse, type NextRequest } from "next/server"
import { getSessionCookie } from "better-auth/cookies"

/** Routes that require a signed-in user. */
const PROTECTED_PREFIXES = [
  "/dashboard",
  "/projects",
  "/tasks",
  "/calendar",
  "/users",
  "/settings",
]

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl

  // Legacy aliases from the original template.
  if (pathname === "/login") {
    return NextResponse.redirect(new URL("/sign-in", request.url))
  }
  if (pathname === "/register") {
    return NextResponse.redirect(new URL("/sign-up", request.url))
  }

  const isProtected = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  )

  if (isProtected && !getSessionCookie(request)) {
    /**
     * Fast path: no session cookie at all, so send them straight to sign-in as
     * an HTTP redirect — nothing is streamed and no loading spinner appears.
     *
     * A cookie that is present but stale cannot be checked here, because the
     * proxy bundle cannot import the database. The dashboard layout verifies
     * the session for real and redirects if it is invalid; that is a normal
     * single navigation, not a loop.
     *
     * Note: this proxy must NOT redirect signed-in users away from /sign-in or
     * /sign-up. A stale cookie would then bounce /sign-in -> /dashboard ->
     * /sign-in forever, which looks like a page stuck flickering between the
     * loading state and the sign-in form.
     */
    const url = new URL("/sign-in", request.url)
    if (pathname !== "/dashboard") {
      url.searchParams.set("redirect", `${pathname}${search}`)
    }
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes, including Better Auth's own endpoints)
     * - _next/static, _next/image (Next internals)
     * - favicon.ico
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
}