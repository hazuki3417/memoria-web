import { describe, expect, it } from "vitest"
import {
  getCommunityDisplayName,
  sortCommunitiesByDisplayName,
} from "./communityDisplayName"

describe("getCommunityDisplayName", () => {
  it("別名があれば別名のみを使用する", () => {
    expect(
      getCommunityDisplayName({
        name: "正式名称",
        mySettings: { alias: "個人用の名前" },
      }),
    ).toBe("個人用の名前")
  })

  it("別名がない場合は正式名称を使用する", () => {
    expect(getCommunityDisplayName({ name: "正式名称" })).toBe("正式名称")
    expect(
      getCommunityDisplayName({
        name: "正式名称",
        mySettings: { alias: null },
      }),
    ).toBe("正式名称")
  })
})

describe("sortCommunitiesByDisplayName", () => {
  it("日本語ロケールで表示名だけを昇順に並べる", () => {
    const candidates = [
      { id: "c", label: "さくら" },
      { id: "b", label: "あおぞら" },
      { id: "a", label: "かぞく" },
    ]
    expect(
      sortCommunitiesByDisplayName(candidates).map((item) => item.id),
    ).toEqual(["b", "a", "c"])
    expect(candidates[0].id).toBe("c")
  })

  it("同じ表示名を統合・除外しない", () => {
    const candidates = [
      { id: "first", label: "家族" },
      { id: "second", label: "家族" },
    ]
    expect(sortCommunitiesByDisplayName(candidates)).toHaveLength(2)
  })
})
