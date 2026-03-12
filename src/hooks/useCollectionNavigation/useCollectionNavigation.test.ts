import { renderHook } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { useCollectionNavigation } from "./useCollectionNavigation"

describe("useCollectionNavigation", () => {
  const items = ["a", "b", "c"]

  it("returns correct current, prev, next", () => {
    const { result } = renderHook(() =>
      useCollectionNavigation({
        items,
        predicate: (item) => item === "b",
        loop: false,
      }),
    )

    expect(result.current.current.item).toBe("b")
    expect(result.current.prev.item).toBe("a")
    expect(result.current.next.item).toBe("c")

    expect(result.current.prev.exists).toBe(true)
    expect(result.current.next.exists).toBe(true)
  })

  it("handles loop navigation", () => {
    const { result } = renderHook(() =>
      useCollectionNavigation({
        items,
        predicate: (item) => item === "a",
        loop: true,
      }),
    )

    expect(result.current.prev.item).toBe("c")
    expect(result.current.next.item).toBe("b")

    expect(result.current.prev.exists).toBe(true)
    expect(result.current.next.exists).toBe(true)
  })
})
