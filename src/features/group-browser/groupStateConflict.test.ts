import { describe, expect, it } from "vitest"
import {
  isGroupCreateOutcomeUnknown,
  isGroupStateConflict,
  isGroupUpdateOutcomeUnknown,
} from "./groupStateConflict"

// Unit responsibility: classify observable transport / GraphQL outcomes.
// Component notification, dialog state and GraphQL wiring belong to later integration tests.
describe("Group mutation outcome classification", () => {
  it("recognizes public conflict code without relying on error message", () => {
    expect(isGroupStateConflict({ graphQLErrors: [{ extensions: { code: "CONFLICT" } }] })).toBe(true)
    expect(isGroupStateConflict({ graphQLErrors: [{ extensions: { code: "VALIDATION" }, message: "conflict" }] })).toBe(false)
    expect(isGroupStateConflict({ networkError: new Error("conflict") })).toBe(false)
  })

  it("treats transport failure as uncertain but rejects confirmed GraphQL errors", () => {
    expect(isGroupUpdateOutcomeUnknown({ networkError: new Error("offline") })).toBe(true)
    expect(isGroupUpdateOutcomeUnknown(new Error("request timed out"))).toBe(true)
    expect(isGroupUpdateOutcomeUnknown({ graphQLErrors: [{ extensions: { code: "VALIDATION" } }] })).toBe(false)
    expect(isGroupUpdateOutcomeUnknown({ graphQLErrors: [{ extensions: { code: "CONFLICT" } }] })).toBe(false)
  })

  it("recognizes an explicit indeterminate atomic-create response", () => {
    expect(isGroupCreateOutcomeUnknown({ graphQLErrors: [{ extensions: { code: "UNKNOWN_OUTCOME" } }] })).toBe(true)
    expect(isGroupCreateOutcomeUnknown({ graphQLErrors: [{ extensions: { code: "DUPLICATE_NAME" } }] })).toBe(false)
    expect(isGroupCreateOutcomeUnknown({ networkError: new Error("disconnect") })).toBe(true)
  })

  it("does not treat unrelated or malformed objects as ambiguous commits", () => {
    for (const value of [null, undefined, "offline", 0, {}, { graphQLErrors: [null, {}] }]) {
      expect(isGroupStateConflict(value)).toBe(false)
      expect(isGroupUpdateOutcomeUnknown(value)).toBe(false)
      expect(isGroupCreateOutcomeUnknown(value)).toBe(false)
    }
  })
})
