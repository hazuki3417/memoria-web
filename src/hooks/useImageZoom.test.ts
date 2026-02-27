import { renderHook, act } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { useImageZoom, UseImageZoomOption } from "./useImageZoom"

describe("useImageZoom", () => {
  const createInitialState = (): UseImageZoomOption => ({
    level: 5,
    config: {
      step: 2,
      min: 0,
      max: 10,
    },
  })

  it("should initialize with correct value", () => {
    const { result } = renderHook(() => useImageZoom(createInitialState()))

    expect(result.current.state.level).toBe(5)
    expect(result.current.state.config).toEqual({
      step: 2,
      min: 0,
      max: 10,
    })
  })

  it("should increment correctly with clamp", () => {
    const { result } = renderHook(() => useImageZoom(createInitialState()))

    act(() => {
      result.current.handler.zoomIn()
    })

    expect(result.current.state.level).toBe(7)
  })

  it("should clamp to max when increment exceeds max", () => {
    const initial = {
      level: 9,
      config: {
        step: 2,
        min: 0,
        max: 10,
      },
    }
    const { result } = renderHook(() => useImageZoom(initial))

    act(() => {
      result.current.handler.zoomIn()
    })

    expect(result.current.state.level).toBe(10)
  })

  it("should decrement correctly with clamp", () => {
    const { result } = renderHook(() => useImageZoom(createInitialState()))

    act(() => {
      result.current.handler.zoomOut()
    })

    expect(result.current.state.level).toBe(3)
  })

  it("should clamp to min when decrement goes below min", () => {
    const initial = {
      level: 1,
      config: {
        step: 2,
        min: 0,
        max: 10,
      },
    }
    const { result } = renderHook(() => useImageZoom(initial))

    act(() => {
      result.current.handler.zoomOut()
    })

    expect(result.current.state.level).toBe(0)
  })

  it("should set value directly with clamp", () => {
    const { result } = renderHook(() => useImageZoom(createInitialState()))

    act(() => {
      result.current.handler.set(8)
    })

    expect(result.current.state.level).toBe(8)
  })

  it("should clamp value when set exceeds max", () => {
    const { result } = renderHook(() => useImageZoom(createInitialState()))

    act(() => {
      result.current.handler.set(20)
    })

    expect(result.current.state.level).toBe(10)
  })

  it("should clamp value when set below min", () => {
    const { result } = renderHook(() => useImageZoom(createInitialState()))

    act(() => {
      result.current.handler.set(-5)
    })

    expect(result.current.state.level).toBe(0)
  })

  it("should reset to initial value", () => {
    const { result } = renderHook(() => useImageZoom(createInitialState()))

    act(() => {
      result.current.handler.set(8)
    })

    act(() => {
      result.current.handler.reset()
    })

    expect(result.current.state.level).toBe(5)
  })
})
