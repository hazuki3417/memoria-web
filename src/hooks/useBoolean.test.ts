import { act, renderHook } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { useBoolean } from "./useBoolean"

describe("useBoolean", () => {
  it("should initialize with initial value", () => {
    const { result } = renderHook(() => useBoolean(true))

    expect(result.current.value).toBe(true)
  })

  it("should set true", () => {
    const { result } = renderHook(() => useBoolean(false))

    act(() => {
      result.current.control.setTrue()
    })

    expect(result.current.value).toBe(true)
  })

  it("should set false", () => {
    const { result } = renderHook(() => useBoolean(true))

    act(() => {
      result.current.control.setFalse()
    })

    expect(result.current.value).toBe(false)
  })

  it("should toggle value", () => {
    const { result } = renderHook(() => useBoolean(false))

    act(() => {
      result.current.control.toggle()
    })

    expect(result.current.value).toBe(true)

    act(() => {
      result.current.control.toggle()
    })

    expect(result.current.value).toBe(false)
  })

  it("should reset to initial", () => {
    const { result } = renderHook(() => useBoolean(true))

    act(() => {
      result.current.control.setFalse()
    })
    expect(result.current.value).toBe(false)

    act(() => {
      result.current.control.reset()
    })
    expect(result.current.value).toBe(true)
  })
})
