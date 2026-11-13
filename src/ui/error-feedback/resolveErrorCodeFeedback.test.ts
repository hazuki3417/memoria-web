import { describe, expect, it } from "vitest"
import { resolveErrorCodeFeedback } from "./resolveErrorCodeFeedback"

const messages = {
  FORBIDDEN: { title: "操作できません" },
  NOT_FOUND: { title: "見つかりません" },
}
const fallback = { title: "状態を確認してください" }

describe("エラーコードと案内の対応付け", () => {
  it("同じ公開コードだけが並ぶときは対応する案内を返す", () => {
    expect(resolveErrorCodeFeedback(["FORBIDDEN", "FORBIDDEN"], messages, fallback))
      .toEqual(messages.FORBIDDEN)
  })

  it("コードが混在・不明・欠損の場合は単一原因を断定せずFallbackする", () => {
    expect(resolveErrorCodeFeedback(["FORBIDDEN", "NOT_FOUND"], messages, fallback))
      .toEqual(fallback)
    expect(resolveErrorCodeFeedback(["FORBIDDEN", null], messages, fallback))
      .toEqual(fallback)
    expect(resolveErrorCodeFeedback(["UNKNOWN"], messages, fallback))
      .toEqual(fallback)
    expect(resolveErrorCodeFeedback([], messages, fallback)).toEqual(fallback)
  })
})
