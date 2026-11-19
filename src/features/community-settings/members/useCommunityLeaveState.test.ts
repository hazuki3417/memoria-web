import { act, createElement } from "react"
import { createRoot, type Root } from "react-dom/client"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { useCommunityLeaveState } from "./useCommunityLeaveState"

const mocks = vi.hoisted(() => ({ notify: vi.fn() }))
vi.mock("@/components/Feedback", () => ({ showNotification: mocks.notify }))

let root: Root | undefined
let host: HTMLDivElement | undefined
let state!: ReturnType<typeof useCommunityLeaveState>

const mount = async ({
  onLeave,
  onLeaveSuccess,
}: {
  onLeave: () => Promise<void>
  onLeaveSuccess: () => void
}) => {
  host = document.createElement("div")
  document.body.appendChild(host)
  root = createRoot(host)
  await act(async () => {
    root?.render(createElement(() => {
      state = useCommunityLeaveState({ onLeave, onLeaveSuccess, blocked: false })
      return null
    }))
  })
}

beforeEach(() => {
  vi.resetAllMocks()
})

afterEach(async () => {
  if (root) await act(async () => { root?.unmount() })
  host?.remove()
  root = undefined
  host = undefined
})

describe("Community退会の確定結果と後続の通知・遷移契約", () => {
  it("退会確定後の通知例外でも遷移し、失敗表示へ戻さない", async () => {
    const onLeave = vi.fn().mockResolvedValue(undefined)
    const onLeaveSuccess = vi.fn()
    mocks.notify.mockImplementation(() => { throw new Error("notification unavailable") })
    await mount({ onLeave, onLeaveSuccess })
    await act(async () => { await state.leave() })
    expect(onLeave).toHaveBeenCalledTimes(1)
    expect(onLeaveSuccess).toHaveBeenCalledTimes(1)
    expect(state.done).toBe(true)
    expect(state.opened).toBe(false)
    expect(state.error).toBe("")
    expect(state.busy).toBe(false)
  })

  it("退会確定後の遷移Callback例外でも成立した結果を維持する", async () => {
    const onLeave = vi.fn().mockResolvedValue(undefined)
    const onLeaveSuccess = vi.fn(() => { throw new Error("navigation unavailable") })
    await mount({ onLeave, onLeaveSuccess })
    await act(async () => { await state.leave() })
    expect(onLeave).toHaveBeenCalledTimes(1)
    expect(onLeaveSuccess).toHaveBeenCalledTimes(1)
    expect(state.done).toBe(true)
    expect(state.error).toBe("")
    expect(state.busy).toBe(false)
  })

  it("退会Action自体の拒否は失敗として表示し、成功通知・遷移を行わない", async () => {
    const onLeave = vi.fn().mockRejectedValue(new Error("mutation unavailable"))
    const onLeaveSuccess = vi.fn()
    await mount({ onLeave, onLeaveSuccess })
    await act(async () => { await state.leave() })
    expect(state.done).toBe(false)
    expect(state.error).toContain("退会処理に失敗しました")
    expect(mocks.notify).not.toHaveBeenCalled()
    expect(onLeaveSuccess).not.toHaveBeenCalled()
    expect(state.busy).toBe(false)
  })
})
