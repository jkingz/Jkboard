import { toNextJsHandler } from "better-auth/next-js"

import { auth } from "@/lib/auth"

/** Better Auth's own endpoints (sign-up, sign-in, sign-out, session, ...). */
export const { GET, POST } = toNextJsHandler(auth.handler)
