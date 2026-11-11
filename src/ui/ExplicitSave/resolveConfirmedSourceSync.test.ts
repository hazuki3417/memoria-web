import { describe, expect, it } from "vitest"
import { resolveConfirmedSourceSync } from "./resolveConfirmedSourceSync"

const incoming = {
  source: "新しいサーバー値",
  expectedEcho: null,
  baseline: "以前の保存値",
  draft: "以前の保存値",
  isUnknown: false,
  canResetDraft: true,
}

describe("明示保存Formの再取得値の同期判定", () => {
  it("未編集のDraftは新しいServer値へ追従できる", () => {
    expect(resolveConfirmedSourceSync(incoming)).toEqual({
      adopt: true,
      resetDraft: true,
    })
  })

  it("編集中のDraftは保持しつつServer基準値だけ進める", () => {
    expect(resolveConfirmedSourceSync({ ...incoming, draft: "編集中の値" })).toEqual({
      adopt: true,
      resetDraft: false,
    })
  })

  it("保存確定後の古いQuery echoを採用しない", () => {
    expect(resolveConfirmedSourceSync({
      ...incoming,
      expectedEcho: "先ほど確定した値",
    })).toEqual({ adopt: false })
  })

  it("確定済み値のQuery echoが到着したら同期を再開する", () => {
    expect(resolveConfirmedSourceSync({
      ...incoming,
      expectedEcho: "新しいサーバー値",
    })).toEqual({ adopt: true, resetDraft: true })
  })

  it("Unknown状態では観測値を勝手に確定扱いしない", () => {
    expect(resolveConfirmedSourceSync({
      ...incoming,
      isUnknown: true,
    })).toEqual({ adopt: false })
  })

  it("保存中・Profile再試行可能な失敗などCaller固有の入力保護を尊重する", () => {
    expect(resolveConfirmedSourceSync({
      ...incoming,
      canResetDraft: false,
    })).toEqual({ adopt: true, resetDraft: false })
  })
})
