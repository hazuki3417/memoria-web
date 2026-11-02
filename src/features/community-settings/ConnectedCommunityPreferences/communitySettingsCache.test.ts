import { InMemoryCache } from "@apollo/client"
import { describe, expect, it } from "vitest"
import {
  CommunityMySettingsDocument,
  CommunitySettingsCacheFragmentDoc,
  MyCommunitiesDocument,
  type OperationCommunitySettingsCacheFragment,
  type OperationCommunityMySettingsQuery,
  type OperationMyCommunitiesQuery,
} from "@/infrastructure/graphql/generated"

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

function updateSettings(
  cache: InMemoryCache,
  patch: Partial<OperationCommunitySettingsCacheFragment["mySettings"]>,
) {
  const id = cache.identify({ __typename: "Community", id: "community-1" })
  expect(id).toBeDefined()
  const previous = cache.readFragment<OperationCommunitySettingsCacheFragment>({
    id,
    fragment: CommunitySettingsCacheFragmentDoc,
  })
  expect(previous).not.toBeNull()
  if (!previous) throw new Error("Community settings cache is missing")
  cache.writeFragment({
    id,
    fragment: CommunitySettingsCacheFragmentDoc,
    data: {
      __typename: "Community",
      mySettings: {
        __typename: "CommunitySettings",
        ...previous.mySettings,
        ...patch,
      },
    },
  })
}

describe("Community設定の生成FragmentとApollo Cache契約", () => {
  it("アクセント更新はAliasを維持し、一覧と設定Queryに反映される", () => {
    const cache = createCache()
    updateSettings(cache, { accentColor: "#AABBCC" })

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

    updateSettings(cache, { alias: aliasResponse.alias })
    updateSettings(cache, { accentColor: accentResponse.accentColor })

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

  it("Alias更新はアクセントを維持し、一覧と設定Queryに反映される", () => {
    const cache = createCache()
    updateSettings(cache, { alias: "New alias" })

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
