import { describe, expect, it } from "vitest"
import { SettingsInputValidationError } from "./graphqlSettingsResult"

describe("Hybrid settings input rejection", () => {
  it("preserves public violation paths and can be distinguished from unknown network outcome", () => {
    const violations = [
      {
        scope: "FIELD",
        code: "INVALID_FORMAT",
        inputPaths: [{ segments: ["accentColor"] }],
      },
    ]
    const error = new SettingsInputValidationError(violations)
    expect(error.kind).toBe("validation")
    expect(error.violations).toEqual(violations)
    expect(error).toHaveProperty("graphQLErrors")
    expect(error.message).toBe("Settings input validation rejected")
  })
})
