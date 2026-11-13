import { describe, expect, it } from "vitest"
import {
  resolveSaveFeedback,
  type SaveFeedbackMessages,
} from "./resolveSaveFeedback"

const messages = {
  validation: { title: "入力を確認", description: "入力内容を修正してください" },
  retryable: { title: "保存失敗", description: "再試行してください" },
  unknown: { title: "保存結果不明", description: "現在の状態を確認してください" },
  blocked: { title: "保存不可", description: "利用条件を確認してください" },
} satisfies SaveFeedbackMessages

describe("共通の保存Feedback解決", () => {
  it("表示不要な状態ではFeedbackを生成しない", () => {
    expect(resolveSaveFeedback(null, messages)).toBeNull()
  })

  it("結果不明は警告としてFeature独自の案内を返す", () => {
    expect(resolveSaveFeedback("unknown", messages)).toEqual({
      type: "unknown",
      kind: "warning",
      ...messages.unknown,
    })
  })

  it.each(["validation", "retryable", "blocked"] as const)(
    "%sはエラーとしてFeature独自の案内を返す",
    (type) => {
      expect(resolveSaveFeedback(type, messages)).toEqual({
        type,
        kind: "error",
        ...messages[type],
      })
    },
  )
})
