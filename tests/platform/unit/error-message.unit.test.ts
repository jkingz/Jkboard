import { describe, expect, it } from "vitest"

import { errorMessage } from "@/lib/error-message"

describe("errorMessage", () => {
  it("prefers the error's own message", () => {
    expect(errorMessage(new Error("Project was not found."), "fallback")).toBe(
      "Project was not found."
    )
  })

  it("falls back when the value is not an Error", () => {
    expect(errorMessage("a raw string", "fallback")).toBe("fallback")
    expect(errorMessage(undefined, "fallback")).toBe("fallback")
    expect(errorMessage(null, "fallback")).toBe("fallback")
    expect(errorMessage({ message: "not an Error" }, "fallback")).toBe("fallback")
  })

  // An Error with an empty message is truthy, so a naive `.message` check
  // returns "" and the toast renders blank. This is the case that motivated
  // the `&& error.message` guard.
  it("falls back when an Error carries an empty message", () => {
    expect(errorMessage(new Error(""), "fallback")).toBe("fallback")
  })

  it("surfaces Zod issues rather than a generic string", () => {
    // ZodError extends Error, so its message is already readable and must win
    // over the fallback — otherwise every validation failure looks the same.
    const zodLike = new Error("[\n  {\n    \"message\": \"Too small\"\n  }\n]")
    expect(errorMessage(zodLike, "fallback")).toContain("Too small")
  })

  it("never returns an empty string", () => {
    const inputs: unknown[] = [new Error(""), "", undefined, null, 0, false, {}]
    for (const input of inputs) {
      expect(errorMessage(input, "Could not save.")).not.toBe("")
    }
  })
})