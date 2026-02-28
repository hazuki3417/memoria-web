import { act, renderHook } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { useDisclosure } from "./useDisclosure"

describe("useDisclosure", () => {
  it("should initialize with initial value", () => {
    const { result } = renderHook(() => useDisclosure({ status: "opened" }))

    expect(result.current.value.status).toBe("opened")
  })

  it("should set open", () => {
    const { result } = renderHook(() => useDisclosure({ status: "closed" }))

    act(() => {
      result.current.control.open()
    })

    expect(result.current.value.status).toBe("opened")
  })

  it("should set close", () => {
    const { result } = renderHook(() => useDisclosure({ status: "opened" }))

    act(() => {
      result.current.control.close()
    })

    expect(result.current.value.status).toBe("closed")
  })

  it("should toggle value", () => {
    const { result } = renderHook(() => useDisclosure({ status: "closed" }))

    act(() => {
      result.current.control.toggle()
    })

    expect(result.current.value.status).toBe("opened")

    act(() => {
      result.current.control.toggle()
    })

    expect(result.current.value.status).toBe("closed")
  })

  it("should reset to initial", () => {
    const { result } = renderHook(() => useDisclosure({ status: "opened" }))

    act(() => {
      result.current.control.close()
    })
    expect(result.current.value.status).toBe("closed")

    act(() => {
      result.current.control.reset()
    })
    expect(result.current.value.status).toBe("opened")
  })
})
