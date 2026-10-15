/**
 * Turn anything thrown into a sentence a person can read.
 *
 * Server actions throw `Error`, Zod throws `ZodError`, and a failed fetch
 * throws something with no message at all. This collapses all three to a
 * string, preferring the error's own message and falling back to the caller's
 * copy when there is none.
 *
 * Lives outside the client store so it is importable by the unit tier: the
 * store is `"use client"` and pulls in the whole UI graph, which a node test
 * environment cannot load.
 */
export function errorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) return error.message
  return fallback
}