import { InMemoryCache } from "@apollo/client"
import { describe, expect, it } from "vitest"
import {
  CommunityMySettingsDocument,
  MyCommunitiesDocument,
  type OperationCommunityMySettingsQuery,
  type OperationMyCommunitiesQuery,
} from "@/infrastructure/graphql/generated"
import { commitCommunitySettingsPatch } from "./communitySettingsCache"

function createCache() {
  const cache = new InMemoryCache()
  cache.writeQuery({
    query: MyCommunitiesDocument,
    data: {
      myCommunities: [
        {
          __typename: "Community",
          id: "community-1",
          name: "Community",
          createdAt: "2026-01-01T00:00:00Z",
          updatedAt: "2026-01-01T00:00:00Z",
          mySettings: {
            __typename: "CommunitySettings",
            accentColor: "#112233",
            alias: "My community",
          },
        },
      ],
    },
  })
  cache.writeQuery({
    query: CommunityMySettingsDocument,
    variables: { communityId: "community-1" },
    data: {
      community: {
        __typename: "Community",
        id: "community-1",
        mySettings: {
          __typename: "CommunitySettings",
          accentColor: "#112233",
          alias: "My community",
        },
      },
    },
  })
  return cache
}

describe("Community設定の生成FragmentとApollo Cache契約", () => {
  it("アクセント更新はAliasを維持し、一覧と設定Queryに反映される", () => {
    const cache = createCache()
    commitCommunitySettingsPatch(cache, "community-1", {
      accentColor: "#AABBCC",
    })

    const community = cache.readQuery<OperationCommunityMySettingsQuery>({
      query: CommunityMySettingsDocument,
      variables: { communityId: "community-1" },
    })
    const list = cache.readQuery<OperationMyCommunitiesQuery>({
      query: MyCommunitiesDocument,
    })
    expect(community?.community?.mySettings).toMatchObject({
      accentColor: "#AABBCC",
      alias: "My community",
    })
    expect(list?.myCommunities[0].mySettings).toMatchObject({
      accentColor: "#AABBCC",
      alias: "My community",
    })
  })

  it("AccentとAliasの応答が逆順でも互いの確定Fieldを巻き戻さない", () => {
    const cache = createCache()
    // The Accent response carries an old Alias; the Alias response carries an
    // old Accent. Only the field actually patched may be committed to cache.
    const accentResponse = { accentColor: "#AABBCC", alias: "My community" }
    const aliasResponse = { accentColor: "#112233", alias: "New alias" }

    commitCommunitySettingsPatch(cache, "community-1", {
      alias: aliasResponse.alias,
    })
    commitCommunitySettingsPatch(cache, "community-1", {
      accentColor: accentResponse.accentColor,
    })

    const community = cache.readQuery<OperationCommunityMySettingsQuery>({
      query: CommunityMySettingsDocument,
      variables: { communityId: "community-1" },
    })
    const list = cache.readQuery<OperationMyCommunitiesQuery>({
      query: MyCommunitiesDocument,
    })
    expect(community?.community?.mySettings).toMatchObject({
      accentColor: "#AABBCC",
      alias: "New alias",
    })
    expect(list?.myCommunities[0].mySettings).toMatchObject({
      accentColor: "#AABBCC",
      alias: "New alias",
    })
  })

  it("Accentを先に確定してもAliasの遅延応答でAccentを巻き戻さない", () => {
    const cache = createCache()
    commitCommunitySettingsPatch(cache, "community-1", {
      accentColor: "#AABBCC",
    })
    // Alias-only response may include a stale Accent; ignore its unrelated field.
    const aliasResponse = { accentColor: "#112233", alias: "New alias" }
    commitCommunitySettingsPatch(cache, "community-1", {
      alias: aliasResponse.alias,
    })

    const community = cache.readQuery<OperationCommunityMySettingsQuery>({
      query: CommunityMySettingsDocument,
      variables: { communityId: "community-1" },
    })
    const list = cache.readQuery<OperationMyCommunitiesQuery>({
      query: MyCommunitiesDocument,
    })
    expect(community?.community?.mySettings).toMatchObject({
      accentColor: "#AABBCC",
      alias: "New alias",
    })
    expect(list?.myCommunities[0].mySettings).toMatchObject({
      accentColor: "#AABBCC",
      alias: "New alias",
    })
  })

  it("未確定のundefinedは無視し、Aliasの明示的なnull解除を保持する", () => {
    const cache = createCache()
    const before = cache.extract()
    commitCommunitySettingsPatch(cache, "community-1", {
      accentColor: undefined,
      alias: undefined,
    })
    expect(cache.extract()).toEqual(before)
    expect(
      cache.readQuery<OperationCommunityMySettingsQuery>({
        query: CommunityMySettingsDocument,
        variables: { communityId: "community-1" },
      })?.community?.mySettings,
    ).toMatchObject({
      accentColor: "#112233",
      alias: "My community",
    })

    commitCommunitySettingsPatch(cache, "community-1", { alias: null })
    expect(
      cache.readQuery<OperationCommunityMySettingsQuery>({
        query: CommunityMySettingsDocument,
        variables: { communityId: "community-1" },
      })?.community?.mySettings,
    ).toMatchObject({
      accentColor: "#112233",
      alias: null,
    })
  })

  it("Alias更新はアクセントを維持し、一覧と設定Queryに反映される", () => {
    const cache = createCache()
    commitCommunitySettingsPatch(cache, "community-1", { alias: "New alias" })

    const community = cache.readQuery<OperationCommunityMySettingsQuery>({
      query: CommunityMySettingsDocument,
      variables: { communityId: "community-1" },
    })
    const list = cache.readQuery<OperationMyCommunitiesQuery>({
      query: MyCommunitiesDocument,
    })
    expect(community?.community?.mySettings).toMatchObject({
      accentColor: "#112233",
      alias: "New alias",
    })
    expect(list?.myCommunities[0].mySettings).toMatchObject({
      accentColor: "#112233",
      alias: "New alias",
    })
  })
})
