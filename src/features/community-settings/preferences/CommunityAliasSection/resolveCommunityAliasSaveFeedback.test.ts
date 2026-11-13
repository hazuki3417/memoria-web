import { describe, expect, it } from "vitest"
import { resolveCommunityAliasSaveFeedback } from "./resolveCommunityAliasSaveFeedback"

const base = {
  failure: null,
  formInvalid: false,
  blockedFeedback: null,
  inspection: { status: "idle" as const },
  normalized: "新しい別名",
  hasInspection: true,
}

describe("Community別名の保存Feedback", () => {
  it("保存失敗がなければFeedbackを表示しない", () => {
    expect(resolveCommunityAliasSaveFeedback(base)).toBeNull()
  })
  it("入力検証拒否の案内を表示する", () => {
    expect(resolveCommunityAliasSaveFeedback({ ...base, formInvalid: true })).toMatchObject({
      type: "validation", title: "入力内容を確認してください",
    })
  })
  it("結果不明はFormエラーより優先し、自動再送しない説明を表示する", () => {
    const feedback = resolveCommunityAliasSaveFeedback({
      ...base, failure: "unknown", formInvalid: true,
    })
    expect(feedback?.type).toBe("unknown")
    expect(feedback?.description).toContain("保存結果は未確定")
  })
  it("照会値の一致は旧Mutationの成功証明としない", () => {
    const feedback = resolveCommunityAliasSaveFeedback({
      ...base,
      failure: "unknown",
      inspection: { status: "matches", alias: "新しい別名" },
    })
    expect(feedback?.description).toContain("成功した証明ではありません")
  })
  it("現在値がnullなら設定なしと表示し、入力Draftとの差異を伝える", () => {
    const feedback = resolveCommunityAliasSaveFeedback({
      ...base,
      failure: "unknown",
      inspection: { status: "differs", alias: null },
    })
    expect(feedback?.description).toContain("「設定なし」")
    expect(feedback?.description).toContain("「新しい別名」")
  })
  it("照会失敗では再送せず再確認を案内する", () => {
    const feedback = resolveCommunityAliasSaveFeedback({
      ...base, failure: "unknown", inspection: { status: "failed" },
    })
    expect(feedback?.description).toContain("保存を再送せず")
  })
  it("照会が利用できない場合は再読み込み前の控えを案内する", () => {
    const feedback = resolveCommunityAliasSaveFeedback({
      ...base, failure: "unknown", hasInspection: false,
    })
    expect(feedback?.description).toContain("入力内容を控えて")
  })
  it("Blocked原因のタイトルと説明を優先する", () => {
    const feedback = resolveCommunityAliasSaveFeedback({
      ...base,
      failure: "blocked",
      blockedFeedback: { title: "保存不可", description: "アカウントの削除処理中です" },
      formInvalid: true,
    })
    expect(feedback).toMatchObject({
      type: "blocked",
      title: "保存不可",
      description: "アカウントの削除処理中です",
    })
  })
  it("再試行可能なエラーは入力Draftの保持を伝える", () => {
    const feedback = resolveCommunityAliasSaveFeedback({
      ...base, failure: "retryable",
    })
    expect(feedback?.type).toBe("retryable")
    expect(feedback?.description).toContain("入力内容を保持")
  })
})
