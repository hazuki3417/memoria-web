import { describe, expect, it } from "vitest"
import { selectDashboardThumbnail } from "./selectDashboardThumbnail"

describe("selectDashboardThumbnail", () => {
  it("picks the smallest usable variant at or above 320px regardless of input order", () => {
    expect(
      selectDashboardThumbnail([
        { width: 640, url: "large" },
        { width: 160, url: "small" },
        { width: 320, url: "medium" },
      ]),
    ).toBe("medium")
  })
  it("falls back to the largest valid smaller thumbnail", () => {
    expect(
      selectDashboardThumbnail([
        { width: 120, url: "small" },
        { width: 240, url: "larger" },
      ]),
    ).toBe("larger")
  })
  it("does not manufacture an image for missing URLs", () => {
    expect(selectDashboardThumbnail([{ width: 800, url: "" }])).toBe("")
    expect(selectDashboardThumbnail([])).toBe("")
  })
})
