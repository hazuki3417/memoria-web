import { describe, expect, it } from "vitest"
import {
  fromGraphqlCommunityPreferences,
  toGraphqlCommunityPreferencesPatch,
} from "./communityPreferencesGraphqlAdapter"

describe("Community PreferencesのGraphQL変換", () => {
  it("取得値から自動保存対象だけを抽出する", () => {
    const settings = { accentColor: "#aabbcc", alias: "別名" }
    expect(fromGraphqlCommunityPreferences(settings)).toEqual({
      accentColor: "#aabbcc",
    })
  })

  it("対象CommunityのAccent Patchを作り、Aliasを含めない", () => {
    expect(
      toGraphqlCommunityPreferencesPatch("community-1", {
        accentColor: "#AABBCC",
      }),
    ).toEqual({ communityId: "community-1", accentColor: "#AABBCC" })
  })
})
