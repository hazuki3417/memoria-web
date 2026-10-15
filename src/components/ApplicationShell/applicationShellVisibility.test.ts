import { describe, expect, it } from "vitest"
import { isApplicationShellFeatureVisible } from "./applicationShellVisibility"

describe("isApplicationShellFeatureVisible", () => {
  it("shows application chrome for an authenticated user", () => {
    expect(
      isApplicationShellFeatureVisible("authenticated", "navigation"),
    ).toBe(true)
    expect(
      isApplicationShellFeatureVisible("authenticated", "context-switcher"),
    ).toBe(true)
    expect(
      isApplicationShellFeatureVisible("authenticated", "account-menu"),
    ).toBe(true)
  })

  it("hides global controls in restricted deletion flows", () => {
    for (const feature of [
      "navigation",
      "context-switcher",
      "account-menu",
    ] as const) {
      expect(
        isApplicationShellFeatureVisible("restricted-flow", feature),
      ).toBe(false)
    }
  })

  it("hides application chrome before user registration", () => {
    expect(
      isApplicationShellFeatureVisible("pre-registration", "navigation"),
    ).toBe(false)
    expect(
      isApplicationShellFeatureVisible("pre-registration", "context-switcher"),
    ).toBe(false)
    expect(
      isApplicationShellFeatureVisible("pre-registration", "account-menu"),
    ).toBe(false)
  })
})
