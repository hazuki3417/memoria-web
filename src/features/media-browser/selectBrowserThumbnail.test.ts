import { describe, expect, it } from "vitest"
import { selectBrowserThumbnail } from "./selectBrowserThumbnail"

describe("selectBrowserThumbnail", () => {
  it("chooses the smallest usable width, independent of input order", () => {
    expect(selectBrowserThumbnail([
      { width: 1920, url: "/large.webp" },
      { width: 640, url: "/medium.webp" },
      { width: 320, url: "/small.webp" },
    ])).toBe("/small.webp")
  })

  it("falls back to the largest available variant for small images", () => {
    expect(selectBrowserThumbnail([
      { width: 120, url: "/tiny.webp" },
      { width: 240, url: "/small.webp" },
    ])).toBe("/small.webp")
  })

  it("returns an empty URL while no variant is available", () => {
    expect(selectBrowserThumbnail([])).toBe("")
    expect(selectBrowserThumbnail([{ width: 640, url: "" }])).toBe("")
  })
})
