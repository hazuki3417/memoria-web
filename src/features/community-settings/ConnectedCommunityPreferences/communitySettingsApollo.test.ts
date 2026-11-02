import { ApolloClient, ApolloLink, InMemoryCache, Observable } from "@apollo/client"
import { describe, expect, it } from "vitest"
import {
  CommunityMySettingsDocument,
  UpdateCommunitySettingsDocument,
  type OperationCommunityMySettingsQuery,
} from "@/infrastructure/graphql/generated"
import { commitCommunitySettingsPatch } from "./communitySettingsCache"

function settings(accentColor: string, alias: string | null) {
  return { __typename: "CommunitySettings", accentColor, alias }
}

describe("Community settings Apollo operation isolation", () => {
  it("does not cache a stale mutation response while Accent and Alias complete out of order", async () => {
    const pending: Array<(data: Record<string, unknown>) => void> = []
    const link = new ApolloLink(() => new Observable((observer) => {
      pending.push((data) => {
        observer.next({ data })
        observer.complete()
      })
    }))
    const cache = new InMemoryCache()
    cache.writeQuery({
      query: CommunityMySettingsDocument,
      variables: { communityId: "community-1" },
      data: {
        community: {
          __typename: "Community",
          id: "community-1",
          mySettings: settings("#112233", "Old alias"),
        },
      },
    })
    const client = new ApolloClient({ cache, link })
    const accent = client.mutate({
      mutation: UpdateCommunitySettingsDocument,
      variables: { input: { communityId: "community-1", accentColor: "#AABBCC" } },
      fetchPolicy: "no-cache",
    })
    const alias = client.mutate({
      mutation: UpdateCommunitySettingsDocument,
      variables: { input: { communityId: "community-1", alias: "New alias" } },
      fetchPolicy: "no-cache",
    })
    expect(pending).toHaveLength(2)

    pending[1]({ updateCommunitySettings: {
      __typename: "UpdateCommunitySettingsPayload",
      settings: settings("#112233", "New alias"),
    } })
    const aliasResult = await alias
    const confirmedAlias = aliasResult.data?.updateCommunitySettings.settings.alias
    if (confirmedAlias === undefined) throw new Error("Alias result missing")
    commitCommunitySettingsPatch(cache, "community-1", { alias: confirmedAlias })
    pending[0]({ updateCommunitySettings: {
      __typename: "UpdateCommunitySettingsPayload",
      settings: settings("#AABBCC", "Old alias"),
    } })
    const accentResult = await accent
    const confirmedAccent = accentResult.data?.updateCommunitySettings.settings.accentColor
    if (!confirmedAccent) throw new Error("Accent result missing")
    commitCommunitySettingsPatch(cache, "community-1", { accentColor: confirmedAccent })

    expect(cache.readQuery<OperationCommunityMySettingsQuery>({
      query: CommunityMySettingsDocument,
      variables: { communityId: "community-1" },
    })?.community?.mySettings).toMatchObject({
      accentColor: "#AABBCC",
      alias: "New alias",
    })
  })

  it("does not replace confirmed cache data when an unknown-outcome inspection returns stale data", async () => {
    const link = new ApolloLink(() => new Observable((observer) => {
      observer.next({ data: {
        community: {
          __typename: "Community",
          id: "community-1",
          mySettings: settings("#112233", "Old alias"),
        },
      } })
      observer.complete()
    }))
    const cache = new InMemoryCache()
    cache.writeQuery({
      query: CommunityMySettingsDocument,
      variables: { communityId: "community-1" },
      data: {
        community: {
          __typename: "Community",
          id: "community-1",
          mySettings: settings("#AABBCC", "New alias"),
        },
      },
    })
    const client = new ApolloClient({ cache, link })
    const inspected = await client.query({
      query: CommunityMySettingsDocument,
      variables: { communityId: "community-1" },
      fetchPolicy: "no-cache",
    })
    expect(inspected.data.community.mySettings.accentColor).toBe("#112233")
    expect(cache.readQuery<OperationCommunityMySettingsQuery>({
      query: CommunityMySettingsDocument,
      variables: { communityId: "community-1" },
    })?.community?.mySettings).toMatchObject({
      accentColor: "#AABBCC",
      alias: "New alias",
    })
  })
})
