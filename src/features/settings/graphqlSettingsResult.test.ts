import { describe, expect, it } from "vitest"
import {
  SettingsInputValidationError,
  classifySettingsSaveFailure,
  resolveSettingsValidation,
} from "./graphqlSettingsResult"

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

  it("maps only a known single FIELD path to the matching Form input", () => {
    const error = new SettingsInputValidationError([
      { scope: "FIELD", code: "REQUIRED", inputPaths: [{ segments: ["nickname"] }] },
      { scope: "FIELD", code: "TOO_LONG", inputPaths: [{ segments: ["unknown"] }] },
      { scope: "FIELD_GROUP", code: "INVALID_COMBINATION", inputPaths: [{ segments: ["nickname"] }] },
    ])
    expect(resolveSettingsValidation(error, ["nickname"])).toEqual({
      fieldErrors: { nickname: "必須項目です。" },
      formError: true,
    })
  })

  it("treats FORM, unknown paths and missing violations as Form errors", () => {
    expect(resolveSettingsValidation(new SettingsInputValidationError([]), ["name"])).toEqual({
      fieldErrors: {},
      formError: true,
    })
    expect(resolveSettingsValidation(new SettingsInputValidationError([
      { scope: "FORM", code: "INVALID_VALUE", inputPaths: [] },
    ]), ["name"]).formError).toBe(true)
  })

  it("distinguishes explicit failure kinds without assuming a transport error is retryable", () => {
    expect(classifySettingsSaveFailure(new SettingsInputValidationError([]))).toBe("validation")
    expect(classifySettingsSaveFailure({ kind: "blocked" })).toBe("blocked")
    expect(classifySettingsSaveFailure({ kind: "retryable" })).toBe("retryable")
    expect(classifySettingsSaveFailure({
      graphQLErrors: [{ extensions: { code: "UNAUTHORIZED" } }],
    })).toBe("blocked")
    expect(classifySettingsSaveFailure({
      errors: [{ extensions: { code: "FORBIDDEN" } }],
    })).toBe("blocked")
    expect(classifySettingsSaveFailure({
      errors: [{ extensions: { code: "INTERNAL_SERVER_ERROR" } }],
    })).toBe("unknown")
    expect(classifySettingsSaveFailure(new Error("network timeout"))).toBe("unknown")
    expect(classifySettingsSaveFailure(new Error("missing response"))).toBe("unknown")
  })

})
