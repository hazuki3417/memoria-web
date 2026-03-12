import { describe, expect, it } from "vitest"
import { getCurrent } from "./getCurrent"

describe("getCurrent", () => {
  const items = ["a", "b", "c"]

  it("returns current item when index is valid", () => {
    const result = getCurrent({ items, index: 1 })

    expect(result.index).toBe(1)
    expect(result.item).toBe("b")
    expect(result.exists).toBe(true)
  })

  it("returns undefined when index is negative", () => {
    const result = getCurrent({ items, index: -1 })

    expect(result.item).toBeUndefined()
    expect(result.exists).toBe(false)
  })

  it("returns undefined when index exceeds length", () => {
    const result = getCurrent({ items, index: 10 })

    expect(result.item).toBeUndefined()
    expect(result.exists).toBe(false)
  })

  it("returns undefined when array is empty", () => {
    const result = getCurrent({ items: [], index: 0 })

    expect(result.item).toBeUndefined()
    expect(result.exists).toBe(false)
  })
})
