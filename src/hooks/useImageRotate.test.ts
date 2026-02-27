import { renderHook, act } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { useImageRotate, UseImageRotateOption } from "./useImageRotate"

describe("useImageRotate", () => {
  const createInitialState = (): UseImageRotateOption => ({
    angle: 90,
  })

  it("should initialize with correct angle", () => {
    const { result } = renderHook(() => useImageRotate(createInitialState()))

    expect(result.current.state.angle).toBe(90)
    expect(result.current.state.initial.angle).toBe(90)
  })

  it("should rotate left by -90 degrees", () => {
    const { result } = renderHook(() => useImageRotate(createInitialState()))

    act(() => {
      result.current.handler.left()
    })

    expect(result.current.state.angle).toBe(0) // 90 - 90 = 0
  })

  it("should rotate right by +90 degrees", () => {
    const { result } = renderHook(() => useImageRotate(createInitialState()))

    act(() => {
      result.current.handler.right()
    })

    expect(result.current.state.angle).toBe(180) // 90 + 90 = 180
  })

  it("should reset to initial angle", () => {
    const { result } = renderHook(() => useImageRotate(createInitialState()))

    act(() => {
      result.current.handler.right() // 90 -> 180
    })

    act(() => {
      result.current.handler.reset() // 180 -> 90
    })

    expect(result.current.state.angle).toBe(90)
  })

  it("should support multiple left and right rotations", () => {
    const { result } = renderHook(() => useImageRotate(createInitialState()))

    act(() => {
      result.current.handler.left() // 90 → 0
      result.current.handler.left() // 0 → -90
      result.current.handler.right() // -90 → 0
    })

    expect(result.current.state.angle).toBe(0)
  })
})
