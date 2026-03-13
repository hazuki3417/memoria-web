import { act, renderHook } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { useSelection } from "./useSelection"

describe("useSelection", () => {
  it("初期値が空の場合、選択は空", () => {
    const { result } = renderHook(() => useSelection<string>())

    expect(result.current.value.size).toBe(0)
    expect(result.current.value.list).toEqual([])
  })

  it("initial が反映される", () => {
    const { result } = renderHook(() =>
      useSelection({
        initial: ["a", "b"],
      }),
    )

    expect(result.current.value.size).toBe(2)
    expect(result.current.value.selected.has("a")).toBe(true)
    expect(result.current.value.selected.has("b")).toBe(true)
  })

  it("select で要素が追加される", () => {
    const { result } = renderHook(() => useSelection<string>())

    act(() => {
      result.current.action.select("a")
    })

    expect(result.current.value.selected.has("a")).toBe(true)
    expect(result.current.value.size).toBe(1)
  })

  it("select は重複追加しない", () => {
    const { result } = renderHook(() => useSelection<string>())

    act(() => {
      result.current.action.select("a")
      result.current.action.select("a")
    })

    expect(result.current.value.size).toBe(1)
  })

  it("deselect で要素が削除される", () => {
    const { result } = renderHook(() =>
      useSelection({
        initial: ["a"],
      }),
    )

    act(() => {
      result.current.action.deselect("a")
    })

    expect(result.current.value.size).toBe(0)
    expect(result.current.value.selected.has("a")).toBe(false)
  })

  it("toggle は選択と解除を切り替える", () => {
    const { result } = renderHook(() => useSelection<string>())

    act(() => {
      result.current.action.toggle("a")
    })

    expect(result.current.value.selected.has("a")).toBe(true)

    act(() => {
      result.current.action.toggle("a")
    })

    expect(result.current.value.selected.has("a")).toBe(false)
  })

  it("clear で全選択解除される", () => {
    const { result } = renderHook(() =>
      useSelection({
        initial: ["a", "b"],
      }),
    )

    act(() => {
      result.current.action.clear()
    })

    expect(result.current.value.size).toBe(0)
  })

  it("isSelected が正しく判定する", () => {
    const { result } = renderHook(() =>
      useSelection<string>({
        initial: ["a"],
      }),
    )

    expect(result.current.action.isSelected("a")).toBe(true)
    expect(result.current.action.isSelected("c")).toBe(false)
  })
})
