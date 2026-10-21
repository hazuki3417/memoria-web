import { describe, expect, it } from "vitest"
import { isGroupStateConflict, isGroupUpdateOutcomeUnknown } from "./groupStateConflict"

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

describe("isGroupUpdateOutcomeUnknown", () => {
  it("classifies a network error as ambiguous and not a definitive GraphQL rejection", () => {
    expect(isGroupUpdateOutcomeUnknown({ networkError: new Error("timeout"), graphQLErrors: [] })).toBe(true)
    expect(isGroupUpdateOutcomeUnknown({ graphQLErrors: [{ extensions: { code: "VALIDATION" } }] })).toBe(false)
    expect(isGroupUpdateOutcomeUnknown({ graphQLErrors: [{ extensions: { code: "CONFLICT" } }] })).toBe(false)
  })
})
