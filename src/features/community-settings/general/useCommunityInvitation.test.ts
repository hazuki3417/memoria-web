import { act, createElement } from "react"
import { createRoot, type Root } from "react-dom/client"
import { afterEach, beforeEach, describe, expect, it } from "vitest"
import { useCommunityInvitation } from "./useCommunityInvitation"

let invitation: ReturnType<typeof useCommunityInvitation>

function Harness({ previewEnabled }: { previewEnabled: boolean }) {
  invitation = useCommunityInvitation("photo-club", previewEnabled)
  return null
}

describe("Community Invitationの本番／Preview境界", () => {
  let root: Root

  beforeEach(() => {
    root = createRoot(document.createElement("div"))
  })

  afterEach(() => {
    act(() => root.unmount())
  })

  it("本番モードでは仮URLを生成せず、発行と変更Actionが無効", async () => {
    act(() => root.render(createElement(Harness, { previewEnabled: false })))
    expect(invitation.invitation).toBe("none")
    expect(invitation.invitationUrl).toBe("")
    expect(invitation.active).toBe(false)
    expect(invitation.confirm).toBeNull()

    act(() => {
      invitation.issue()
      invitation.changeInvitation()
    })
    await invitation.copyInvitation()

    expect(invitation.invitation).toBe("none")
    expect(invitation.invitationUrl).toBe("")
    expect(invitation.active).toBe(false)
    expect(invitation.busy).toBe(false)
  })

  it("未接続モードの確認更新はPreviewへ切り替えても残らない", () => {
    act(() => root.render(createElement(Harness, { previewEnabled: false })))

    act(() => invitation.setConfirm("reissue"))
    expect(invitation.confirm).toBeNull()

    act(() => root.render(createElement(Harness, { previewEnabled: true })))
    expect(invitation.confirm).toBeNull()
  })
})
