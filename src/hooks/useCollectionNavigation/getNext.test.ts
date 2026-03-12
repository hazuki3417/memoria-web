import { describe, expect, it } from "vitest"
import { getNext } from "./getNext"

describe("getNext", () => {
  const items = ["a", "b", "c"]

  it("returns next item normally", () => {
    const result = getNext({
      items,
      index: 0,
      loop: false,
    })

    expect(result.index).toBe(1)
    expect(result.item).toBe("b")
    expect(result.exists).toBe(true)
  })

  it("returns not exists when last item and loop=false", () => {
    const result = getNext({
      items,
      index: 2,
      loop: false,
    })

    expect(result.item).toBeUndefined()
    expect(result.exists).toBe(false)
  })

  it("returns first item when last item and loop=true", () => {
    const result = getNext({
      items,
      index: 2,
      loop: true,
    })

    expect(result.index).toBe(0)
    expect(result.item).toBe("a")
    expect(result.exists).toBe(true)
  })

  it("handles index = -1", () => {
    const result = getNext({
      items,
      index: -1,
      loop: false,
    })

    expect(result.item).toBe("a")
    expect(result.exists).toBe(true)
  })

  it("handles index > length", () => {
    const result = getNext({
      items,
      index: 10,
      loop: false,
    })

    expect(result.exists).toBe(false)
  })

  it("handles empty array", () => {
    const result = getNext({
      items: [],
      index: 0,
      loop: true,
    })

    expect(result.item).toBeUndefined()
    expect(result.exists).toBe(false)
  })

  it("works correctly when length = 1 and loop=false", () => {
    const result = getNext({
      items: ["a"],
      index: 0,
      loop: false,
    })

    expect(result.exists).toBe(false)
  })

  it("works correctly when length = 1 and loop=true", () => {
    const result = getNext({
      items: ["a"],
      index: 0,
      loop: true,
    })

    expect(result.item).toBe("a")
    expect(result.exists).toBe(true)
  })
})
