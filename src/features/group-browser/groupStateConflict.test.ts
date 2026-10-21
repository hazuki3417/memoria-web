import { describe, expect, it } from "vitest"
import { isGroupStateConflict } from "./groupStateConflict"

describe("isGroupStateConflict", () => {
  it("recognizes GraphQL CONFLICT without relying on message text", () => {
    expect(isGroupStateConflict({ graphQLErrors: [{ message: "conflict", extensions: { code: "CONFLICT" } }] })).toBe(true)
    expect(isGroupStateConflict({ graphQLErrors: [{ message: "conflict", extensions: { code: "VALIDATION" } }] })).toBe(false)
  })
  it("does not treat network or unexpected errors as definite concurrent edits", () => {
    expect(isGroupStateConflict(new Error("conflict"))).toBe(false)
    expect(isGroupStateConflict(null)).toBe(false)
    expect(isGroupStateConflict({ graphQLErrors: [] })).toBe(false)
  })
})
