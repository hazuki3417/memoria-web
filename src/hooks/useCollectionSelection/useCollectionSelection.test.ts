import { act, renderHook } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { useCollectionSelection } from "./useCollectionSelection"

type Item = {
  id: string
  name: string
}

const items: Item[] = [
  { id: "a", name: "A" },
  { id: "b", name: "B" },
  { id: "c", name: "C" },
]

const getKey = (item: Item) => item.id

describe("useCollectionSelection", () => {
  it("初期状態は選択なし", () => {
    const { result } = renderHook(() =>
      useCollectionSelection({ items, getKey }),
    )

    expect(result.current.value.size).toBe(0)
    expect(result.current.value.allSelected).toBe(false)
    expect(result.current.value.indeterminate).toBe(false)
  })

  it("toggle でアイテムが選択される", () => {
    const { result } = renderHook(() =>
      useCollectionSelection({ items, getKey }),
    )

    act(() => {
      result.current.action.toggle(items[0])
    })

    expect(result.current.value.ids).toEqual(["a"])
    expect(result.current.value.size).toBe(1)
  })

  it("toggle で選択が解除される", () => {
    const { result } = renderHook(() =>
      useCollectionSelection({ items, getKey }),
    )

    act(() => {
      result.current.action.toggle(items[0])
    })

    expect(result.current.value.size).toBe(1)

    act(() => {
      result.current.action.toggle(items[0])
    })

    expect(result.current.value.size).toBe(0)
  })

  it("selectAll ですべて選択される", () => {
    const { result } = renderHook(() =>
      useCollectionSelection({ items, getKey }),
    )

    act(() => {
      result.current.action.selectAll()
    })

    expect(result.current.value.ids).toEqual(["a", "b", "c"])
    expect(result.current.value.size).toBe(3)
    expect(result.current.value.allSelected).toBe(true)
  })

  it("clear で全選択解除される", () => {
    const { result } = renderHook(() =>
      useCollectionSelection({ items, getKey }),
    )

    act(() => {
      result.current.action.selectAll()
    })

    expect(result.current.value.size).toBe(3)

    act(() => {
      result.current.action.clear()
    })

    expect(result.current.value.size).toBe(0)
  })

  it("一部選択時は indeterminate になる", () => {
    const { result } = renderHook(() =>
      useCollectionSelection({ items, getKey }),
    )

    act(() => {
      result.current.action.toggle(items[0])
    })

    expect(result.current.value.indeterminate).toBe(true)
    expect(result.current.value.allSelected).toBe(false)
  })

  it("max 制限を超えて選択できない", () => {
    const { result } = renderHook(() =>
      useCollectionSelection({
        items,
        getKey,
        max: 2,
      }),
    )

    act(() => {
      result.current.action.toggle(items[0])
    })

    act(() => {
      result.current.action.toggle(items[1])
    })

    act(() => {
      result.current.action.toggle(items[2])
    })

    expect(result.current.value.size).toBe(2)
  })

  it("min 制限以下には解除できない", () => {
    const { result } = renderHook(() =>
      useCollectionSelection({
        items,
        getKey,
        min: 1,
      }),
    )

    act(() => {
      result.current.action.toggle(items[0])
    })

    expect(result.current.value.size).toBe(1)

    act(() => {
      result.current.action.toggle(items[0])
    })

    expect(result.current.value.size).toBe(1)
  })
})
