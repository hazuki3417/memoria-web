import { describe, expect, it } from "vitest"
import { resolvePersonalAccent } from "./personalAccentPreview"

describe("Personal Accentの画面限定Preview", () => {
  it("有効な選択色を即時反映しHEXを正規化する", () => {
    expect(resolvePersonalAccent("#112233", "#aabbcc")).toBe("#AABBCC")
  })
  it("未完成HEXをPreviewしない", () => {
    expect(resolvePersonalAccent("#112233", "#123")).toBe("#112233")
  })
  it("画面離脱でPreviewを破棄した後はQuery値を表示する", () => {
    expect(resolvePersonalAccent("#445566", null)).toBe("#445566")
  })
})
