import { describe, expect, it } from "vitest"
import { createApolloCache } from "@/infrastructure/graphql/createApolloCache"
import { CurrentUserDocument, PersonalSettingsAccentDocument, PersonalSettingsPreferencesDocument, type OperationPersonalSettingsPreferencesQuery, type OperationPersonalSettingsAccentQuery } from "@/infrastructure/graphql/generated"
import { commitPersonalPreferencesPatch } from "./personalPreferencesCache"
import { defaultUserPreferences } from "./userPreferences"

describe("Personal PreferencesのCache境界", () => {
  it("部分取得と確定Patchは他Fieldを維持し、falseとundefinedを区別する", () => {
    const cache = createApolloCache()
    cache.writeQuery({
      query: CurrentUserDocument,
      data: { me: { __typename: "User", id: "user-1", profile: { __typename: "UserProfile", nickname: "User" },
        preferences: { __typename: "UserPreferences", ...defaultUserPreferences, mediaDetailNavigationWrap: true } } },
    })
    cache.writeQuery({
      query: PersonalSettingsAccentDocument,
      data: { me: { __typename: "User", id: "user-1", preferences: { __typename: "UserPreferences", personalAccentColor: "#112233" } } },
    })
    expect(commitPersonalPreferencesPatch(cache, "user-1", {
      mediaDetailNavigationWrap: false, dateFormat: undefined,
    })).toBe(true)
    expect(cache.readQuery<OperationPersonalSettingsPreferencesQuery>({ query: PersonalSettingsPreferencesDocument })?.me?.preferences).toMatchObject({
      ...defaultUserPreferences, personalAccentColor: "#112233", mediaDetailNavigationWrap: false,
    })
  })

  it("未取得のUserを生成せず、他Userの設定にも反映しない", () => {
    const cache = createApolloCache()
    cache.writeQuery({
      query: PersonalSettingsAccentDocument,
      data: { me: { __typename: "User", id: "user-2", preferences: { __typename: "UserPreferences", personalAccentColor: "#112233" } } },
    })
    const before = cache.extract()
    expect(commitPersonalPreferencesPatch(cache, "user-1", { personalAccentColor: "#AABBCC" })).toBe(false)
    expect(cache.readQuery<OperationPersonalSettingsAccentQuery>({ query: PersonalSettingsAccentDocument })?.me?.preferences.personalAccentColor).toBe("#112233")
    expect(cache.extract()).toEqual(before)
  })
})
