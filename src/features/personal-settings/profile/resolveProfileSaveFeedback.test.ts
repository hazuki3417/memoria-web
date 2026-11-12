import { describe, expect, it } from "vitest"
import { resolveProfileSaveFeedback } from "./resolveProfileSaveFeedback"

type Inputs = Parameters<typeof resolveProfileSaveFeedback>[0]

function feedback(overrides: Partial<Inputs> = {}) {
  return resolveProfileSaveFeedback({
    saveState: "idle",
    formInvalid: false,
    isUnknown: false,
    isBlocked: false,
    blockedFeedback: null,
    inspection: { status: "idle" },
    normalized: "未保存の名前",
    blockedMessage: "プロフィールを更新できません",
    hasInspector: true,
    ...overrides,
  })
}

describe("Profile保存のFeedback表示モデル", () => {
  it("正常状態では何も表示しない", () => {
    expect(feedback()).toEqual([])
  })

  it("再試行可能エラーとForm Validationが同時にあれば既存の2パネルを保持する", () => {
    expect(feedback({ saveState: "retryable-error", formInvalid: true })
      .map((section) => section.id)).toEqual(["retryable", "validation"])
  })

  it("Blocked時には固有の理由または呼び出し元の既定文言を使う", () => {
    expect(feedback({ isBlocked: true })[0]).toMatchObject({
      id: "blocked",
      kind: "error",
      title: "プロフィールを変更できません",
      description: "プロフィールを更新できません",
    })
    expect(feedback({ isBlocked: true, blockedFeedback: {
      title: "権限なし", description: "編集不可",
    } })[0]).toMatchObject({ title: "権限なし", description: "編集不可" })
  })

  it("Unknownは保存成功と断定せず、照会一致を説明する", () => {
    const section = feedback({
      isUnknown: true,
      inspection: { status: "matches", nickname: "未保存の名前" },
    })[0]
    expect(section).toMatchObject({
      id: "unknown", kind: "warning",
      title: "プロフィールの保存結果を確認できませんでした",
    })
    expect(section.details).toEqual([
      expect.stringContaining("成功した証明ではありません"),
    ])
  })

  it("照会不一致・失敗時は既存の説明を出す", () => {
    expect(feedback({
      isUnknown: true,
      inspection: { status: "differs", nickname: "サーバーの名前" },
    })[0]?.details?.[0]).toContain("サーバーの名前")
    expect(feedback({
      isUnknown: true,
      inspection: { status: "failed" },
    })[0]?.details?.[0]).toContain("状態の確認をやり直してください")
  })

  it("照会できない画面では入力控えと再読み込みを案内する", () => {
    expect(feedback({ isUnknown: true, hasInspector: false })[0]?.details)
      .toEqual([expect.stringContaining("入力内容を控えてから")])
  })

  it("UnknownとForm Validationが重なっても既存の独立したPanelを保持する", () => {
    expect(feedback({ isUnknown: true, formInvalid: true })
      .map((section) => section.id)).toEqual(["validation", "unknown"])
  })
})
