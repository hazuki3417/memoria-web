import { act, createElement } from "react"
import { createRoot, type Root } from "react-dom/client"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { useRisingEdge } from "./useRisingEdge"

function Status({
  failed,
  onRise,
}: {
  failed: boolean
  onRise: () => void
}) {
  useRisingEdge(failed, onRise)
  return null
}

describe("useRisingEdge", () => {
  let root: Root
  const onRise = vi.fn()

  beforeEach(() => {
    onRise.mockClear()
    root = createRoot(document.createElement("div"))
  })

  afterEach(() => {
    act(() => root.unmount())
  })

  it("初回からtrueなら1回通知し、同じtrueでは重複せず、復旧後の再失敗を通知する", () => {
    act(() => root.render(createElement(Status, { failed: true, onRise })))
    expect(onRise).toHaveBeenCalledTimes(1)

    act(() => root.render(createElement(Status, { failed: true, onRise })))
    expect(onRise).toHaveBeenCalledTimes(1)

    act(() => root.render(createElement(Status, { failed: false, onRise })))
    expect(onRise).toHaveBeenCalledTimes(1)

    act(() => root.render(createElement(Status, { failed: true, onRise })))
    expect(onRise).toHaveBeenCalledTimes(2)
  })
})
