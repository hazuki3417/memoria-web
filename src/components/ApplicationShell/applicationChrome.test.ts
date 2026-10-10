import { describe, expect, it } from "vitest"
import { isApplicationChromeFeatureVisible } from "./applicationChrome"

describe("isApplicationChromeFeatureVisible", () => {
  it("shows application chrome for an authenticated user", () => {
    expect(
      isApplicationChromeFeatureVisible("authenticated", "navigation"),
    ).toBe(true)
    expect(
      isApplicationChromeFeatureVisible("authenticated", "context-switcher"),
    ).toBe(true)
    expect(
      isApplicationChromeFeatureVisible("authenticated", "account-menu"),
    ).toBe(true)
  })

  it("hides global controls in restricted deletion flows", () => {
    for (const feature of ["navigation", "context-switcher", "account-menu"] as const) {
      expect(isApplicationChromeFeatureVisible("restricted-flow", feature)).toBe(false)
    }
  })

  it("hides application chrome before user registration", () => {
    expect(
      isApplicationChromeFeatureVisible("pre-registration", "navigation"),
    ).toBe(false)
    expect(
      isApplicationChromeFeatureVisible("pre-registration", "context-switcher"),
    ).toBe(false)
    expect(
      isApplicationChromeFeatureVisible("pre-registration", "account-menu"),
    ).toBe(false)
  })
})
