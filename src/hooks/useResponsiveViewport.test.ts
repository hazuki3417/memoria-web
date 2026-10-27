import { describe, expect, it } from "vitest"
import { classifyViewport } from "./classifyViewport"

describe("classifyViewport", () => {
  it("returns compact below sm", () => {
    expect(classifyViewport(false, false)).toBe("compact")
  })

  it("returns medium between sm and xl", () => {
    expect(classifyViewport(true, false)).toBe("medium")
  })

  it("returns wide at and above xl", () => {
    expect(classifyViewport(true, true)).toBe("wide")
  })

  it("prioritizes xl if inconsistent media-query results are observed", () => {
    expect(classifyViewport(false, true)).toBe("wide")
  })
})
