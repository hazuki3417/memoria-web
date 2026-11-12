import { describe, expect, it } from "vitest"
import { getProfileSaveFeedback } from "./profileSaveFeedback"

const base = {
  status: { kind: "idle" as const },
  formInvalid: false,
  inspection: { kind: "idle" as const },
  normalized: "入力した名前",
  canInspect: true,
  blockedMessage: "画面を再読み込みしてください",
}

describe("Profile保存のFeedback定義", () => {
  it("保存前の通常状態ではFeedbackを表示しない", () => {
    expect(getProfileSaveFeedback(base)).toEqual([])
  })

  it("再試行可能な失敗とフォーム全体の検証エラーは順序を維持して表示する", () => {
    const feedbacks = getProfileSaveFeedback({
      ...base,
      status: { kind: "retryable-error" },
      formInvalid: true,
    })
    expect(feedbacks.map(({ id }) => id)).toEqual(["retryable", "validation"])
    expect(feedbacks.every(({ kind }) => kind === "error")).toBe(true)
  })

  it("結果不明時には自動再送しない理由と確認手段を案内する", () => {
    const feedbacks = getProfileSaveFeedback({
      ...base,
      status: { kind: "unknown" },
      canInspect: false,
    })
    expect(feedbacks).toHaveLength(1)
    expect(feedbacks[0].kind).toBe("warning")
    expect(feedbacks[0].description).toContain("自動で再送しません")
    expect(feedbacks[0].details).toContain(
      "この画面では現在の状態を照会できません。入力内容を控えてから画面を再読み込みしてください。",
    )
  })

  it("現在値が一致しても前回の保存成功と断定しない", () => {
    const feedbacks = getProfileSaveFeedback({
      ...base,
      status: { kind: "unknown" },
      inspection: { kind: "matches", value: "入力した名前" },
    })
    expect(feedbacks[0].details?.[0]).toContain("成功した証明ではありません")
  })

  it("現在値が異なる場合は比較する名前と再保存・破棄の選択を示す", () => {
    const feedbacks = getProfileSaveFeedback({
      ...base,
      status: { kind: "unknown" },
      inspection: { kind: "differs", value: "現在の名前" },
    })
    expect(feedbacks[0].details?.[0]).toContain("現在の名前")
    expect(feedbacks[0].details?.[0]).toContain("入力した名前")
    expect(feedbacks[0].details?.[0]).toContain("変更を破棄")
  })

  it("照会失敗では保存操作を再送せず確認をやり直すよう案内する", () => {
    const feedbacks = getProfileSaveFeedback({
      ...base,
      status: { kind: "unknown" },
      inspection: { kind: "failed" },
    })
    expect(feedbacks[0].details?.[0]).toContain("保存操作は再送せず")
  })

  it("保存不可の表示ではFeature固有のメッセージを優先し、不足時だけFallbackする", () => {
    const feedback = { title: "ログインが必要です", description: "" }
    const result = getProfileSaveFeedback({
      ...base,
      status: { kind: "blocked", feedback },
    })
    expect(result).toEqual([{
      id: "blocked",
      kind: "error",
      title: "ログインが必要です",
      description: "画面を再読み込みしてください",
    }])
  })
})
