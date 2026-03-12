import { describe, expect, it } from "vitest"
import { getPrev } from "./getPrev"

describe("getPrev", () => {
  const items = ["a", "b", "c"]

  it("returns previous item normally", () => {
    const result = getPrev({
      items,
      index: 2,
      loop: false,
    })

    expect(result.index).toBe(1)
    expect(result.item).toBe("b")
    expect(result.exists).toBe(true)
  })

  it("returns not exists when first item and loop=false", () => {
    const result = getPrev({
      items,
      index: 0,
      loop: false,
    })

    expect(result.item).toBeUndefined()
    expect(result.exists).toBe(false)
  })

  it("returns last item when first item and loop=true", () => {
    const result = getPrev({
      items,
      index: 0,
      loop: true,
    })

    expect(result.index).toBe(2)
    expect(result.item).toBe("c")
    expect(result.exists).toBe(true)
  })

  it("handles index = -1", () => {
    const result = getPrev({
      items,
      index: -1,
      loop: false,
    })

    expect(result.item).toBeUndefined()
    expect(result.exists).toBe(false)
  })

  it("handles index > length", () => {
    const result = getPrev({
      items,
      index: 10,
      loop: false,
    })

    expect(result.exists).toBe(false)
  })

  it("handles empty array", () => {
    const result = getPrev({
      items: [],
      index: 0,
      loop: true,
    })

    expect(result.item).toBeUndefined()
    expect(result.exists).toBe(false)
  })

  it("works correctly when length = 1 and loop=false", () => {
    const result = getPrev({
      items: ["a"],
      index: 0,
      loop: false,
    })

    expect(result.exists).toBe(false)
  })

  it("works correctly when length = 1 and loop=true", () => {
    const result = getPrev({
      items: ["a"],
      index: 0,
      loop: true,
    })

    expect(result.item).toBe("a")
    expect(result.exists).toBe(true)
  })
})
