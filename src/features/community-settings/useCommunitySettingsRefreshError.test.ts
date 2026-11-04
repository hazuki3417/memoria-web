import { act, createElement } from "react"
import { createRoot } from "react-dom/client"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { showNotification } from "@/components/Feedback"
import { useCommunitySettingsRefreshError } from "./useCommunitySettingsRefreshError"

vi.mock("@/components/Feedback", () => ({
  showNotification: vi.fn(),
}))

function RefreshStatus({ failed }: { failed: boolean }) {
  useCommunitySettingsRefreshError(failed)
  return null
}

describe("Community Settingsの再取得失敗通知", () => {
  const container = document.createElement("div")
  const root = createRoot(container)

  beforeEach(() => {
    vi.mocked(showNotification).mockClear()
  })

  afterEach(() => {
    act(() => {
      root.render(createElement(RefreshStatus, { failed: false }))
    })
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
