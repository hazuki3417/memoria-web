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

describe("Profile保存Feedbackの単一表示", () => {
  it("通常状態と保存中にはFeedbackを表示しない", () => {
    expect(getProfileSaveFeedback(base)).toBeNull()
    expect(getProfileSaveFeedback({ ...base, status: { kind: "saving" } })).toBeNull()
  })

  it("入力検証と再試行可能エラーが重なった場合は具体的な検証案内を1件だけ返す", () => {
    const feedback = getProfileSaveFeedback({
      ...base,
      status: { kind: "retryable-error" },
      formInvalid: true,
    })
    expect(feedback?.type).toBe("validation")
    expect(feedback?.kind).toBe("error")
  })

  it("検証エラーがない場合は保存失敗の再試行を案内する", () => {
    const feedback = getProfileSaveFeedback({
      ...base,
      status: { kind: "retryable-error" },
    })
    expect(feedback?.type).toBe("retryable")
    expect(feedback?.description).toContain("再試行")
  })

  it("結果不明は入力エラーより優先し、自動再送を防ぐ説明を返す", () => {
    const feedback = getProfileSaveFeedback({
      ...base,
      status: { kind: "unknown" },
      formInvalid: true,
    })
    expect(feedback?.type).toBe("unknown")
    expect(feedback?.kind).toBe("warning")
    expect(feedback?.description).toContain("自動で再送しません")
  })

  it("照会できない場合は入力の保全と再読み込みを案内する", () => {
    const feedback = getProfileSaveFeedback({
      ...base,
      status: { kind: "unknown" },
      canInspect: false,
    })
    expect(feedback?.description).toContain("入力内容を控えて")
    expect(feedback?.description).toContain("自動で再送しません")
  })

  it("現在値が一致しても以前の保存成功と断定しない", () => {
    const feedback = getProfileSaveFeedback({
      ...base,
      status: { kind: "unknown" },
      inspection: { kind: "matches", value: "入力した名前" },
    })
    expect(feedback?.description).toContain("成功した証明ではありません")
  })

  it("現在値が異なる場合は再保存と破棄を案内する", () => {
    const feedback = getProfileSaveFeedback({
      ...base,
      status: { kind: "unknown" },
      inspection: { kind: "differs", value: "現在の名前" },
    })
    expect(feedback?.description).toContain("現在の名前")
    expect(feedback?.description).toContain("入力した名前")
    expect(feedback?.description).toContain("変更を破棄")
  })

  it("照会失敗では保存を再送せず、確認のやり直しを案内する", () => {
    const feedback = getProfileSaveFeedback({
      ...base,
      status: { kind: "unknown" },
      inspection: { kind: "failed" },
    })
    expect(feedback?.description).toContain("保存操作は再送せず")
  })

  it("保存不可は入力エラーより優先し、Featureの具体的な案内を利用する", () => {
    const feedback = getProfileSaveFeedback({
      ...base,
      formInvalid: true,
      status: {
        kind: "blocked",
        feedback: { title: "ログインが必要です", description: "ログインしてください" },
      },
    })
    expect(feedback).toEqual({
      type: "blocked",
      kind: "error",
      title: "ログインが必要です",
      description: "ログインしてください",
    })
  })

  it("保存不可の説明が空の場合はFeatureが渡したFallbackを利用する", () => {
    const feedback = getProfileSaveFeedback({
      ...base,
      status: {
        kind: "blocked",
        feedback: { title: "変更できません", description: "" },
      },
    })
    expect(feedback?.description).toBe("画面を再読み込みしてください")
  })
})
