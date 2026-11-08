import { act, createElement } from "react"
import { createRoot, type Root } from "react-dom/client"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { showNotification } from "@/components/Feedback"
import { useSettingsRefreshError } from "./useSettingsRefreshError"

vi.mock("@/components/Feedback", () => ({
  showNotification: vi.fn(),
}))

function RefreshStatus({ failed }: { failed: boolean }) {
  useSettingsRefreshError(failed)
  return null
}

describe("Personal Settingsの再取得失敗通知", () => {
  let root: Root

  beforeEach(() => {
    vi.mocked(showNotification).mockClear()
    root = createRoot(document.createElement("div"))
  })

  afterEach(() => {
    act(() => root.unmount())
  })

  it("取得成功中は通知せず、失敗への遷移ごとに1回だけ通知する", () => {
    act(() => {
      root.render(createElement(RefreshStatus, { failed: false }))
    })
    expect(showNotification).not.toHaveBeenCalled()

    act(() => {
      root.render(createElement(RefreshStatus, { failed: true }))
    })
    expect(showNotification).toHaveBeenCalledExactlyOnceWith({
      kind: "error",
      title: "設定の更新に失敗しました",
      description:
        "表示中の情報を維持しています。最新の情報はページを再読み込みして確認してください。",
    })

    act(() => {
      root.render(createElement(RefreshStatus, { failed: true }))
    })
    expect(showNotification).toHaveBeenCalledTimes(1)

    act(() => {
      root.render(createElement(RefreshStatus, { failed: false }))
    })
    expect(showNotification).toHaveBeenCalledTimes(1)

    act(() => {
      root.render(createElement(RefreshStatus, { failed: true }))
    })
    expect(showNotification).toHaveBeenCalledTimes(2)
  })
})
