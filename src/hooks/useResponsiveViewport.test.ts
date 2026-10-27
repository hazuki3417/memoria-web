import { describe, expect, it } from "vitest"
import type { ResponsiveViewport, ViewportCategory } from "./useResponsiveViewport"

describe("ResponsiveViewport contract", () => {
  it("represents the unresolved viewport without guessing a category", () => {
    const viewport: ResponsiveViewport = { category: null, isResolved: false }
    expect(viewport.category).toBeNull()
    expect(viewport.isResolved).toBe(false)
  })

  it("supports all three resolved viewport categories", () => {
    const categories: ViewportCategory[] = ["compact", "medium", "wide"]
    expect(categories).toHaveLength(3)
  })
})
