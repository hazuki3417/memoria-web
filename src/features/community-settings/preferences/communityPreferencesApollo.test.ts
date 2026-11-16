import {
  ApolloClient,
  ApolloProvider,
  ApolloLink,
  InMemoryCache,
  Observable,
} from "@apollo/client"
import { GraphQLError } from "graphql"
import { act, createElement } from "react"
import { createRoot } from "react-dom/client"
import { createApolloCache } from "@/infrastructure/graphql/createApolloCache"
import { createSettingsCacheReadProtectionLink } from "@/infrastructure/graphql/settingsCacheReadProtection"
import { useCommunityPreferencesSave } from "./useCommunityPreferencesSave"
import { useCommunityAliasSave } from "./CommunityAliasSection/useCommunityAliasSave"
import { describe, expect, it } from "vitest"
import {
  CommunityMySettingsDocument,
  UpdateCommunitySettingsDocument,
  type OperationCommunityMySettingsQuery,
} from "@/infrastructure/graphql/generated"
import { commitCommunitySettingsPatch } from "./communityPreferencesCache"
import { requireSettingsMutationOutcome, classifySettingsSaveFailure } from "@/infrastructure/graphql/settingsMutationResult"

function settings(accentColor: string, alias: string | null) {
  return { __typename: "CommunitySettings", accentColor, alias }
}

describe("Community settings Apollo operation isolation", () => {
  it("does not cache a stale mutation response while Accent and Alias complete out of order", async () => {
    const pending: Array<(data: Record<string, unknown>) => void> = []
    const link = new ApolloLink(
      () =>
        new Observable((observer) => {
          pending.push((data) => {
            observer.next({ data })
            observer.complete()
          })
        }),
    )
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
      variables: {
        input: { communityId: "community-1", accentColor: "#AABBCC" },
      },
      fetchPolicy: "no-cache",
    })
    const alias = client.mutate({
      mutation: UpdateCommunitySettingsDocument,
      variables: { input: { communityId: "community-1", alias: "New alias" } },
      fetchPolicy: "no-cache",
    })
    expect(pending).toHaveLength(2)

    pending[1]({
      updateCommunitySettings: {
        __typename: "UpdateCommunitySettingsSuccess",
        settings: settings("#112233", "New alias"),
      },
    })
    const aliasResult = await alias
    const confirmedAlias =
      aliasResult.data?.updateCommunitySettings.__typename ===
      "UpdateCommunitySettingsSuccess"
        ? aliasResult.data.updateCommunitySettings.settings.alias
        : undefined
    if (confirmedAlias === undefined) throw new Error("Alias result missing")
    commitCommunitySettingsPatch(cache, "community-1", {
      alias: confirmedAlias,
    })
    pending[0]({
      updateCommunitySettings: {
        __typename: "UpdateCommunitySettingsSuccess",
        settings: settings("#AABBCC", "Old alias"),
      },
    })
    const accentResult = await accent
    const confirmedAccent =
      accentResult.data?.updateCommunitySettings.__typename ===
      "UpdateCommunitySettingsSuccess"
        ? accentResult.data.updateCommunitySettings.settings.accentColor
        : undefined
    if (!confirmedAccent) throw new Error("Accent result missing")
    commitCommunitySettingsPatch(cache, "community-1", {
      accentColor: confirmedAccent,
    })

    expect(
      cache.readQuery<OperationCommunityMySettingsQuery>({
        query: CommunityMySettingsDocument,
        variables: { communityId: "community-1" },
      })?.community?.mySettings,
    ).toMatchObject({
      accentColor: "#AABBCC",
      alias: "New alias",
    })
  })

  it("does not replace confirmed cache data when an unknown-outcome inspection returns stale data", async () => {
    const link = new ApolloLink(
      () =>
        new Observable((observer) => {
          observer.next({
            data: {
              community: {
                __typename: "Community",
                id: "community-1",
                mySettings: settings("#112233", "Old alias"),
              },
            },
          })
          observer.complete()
        }),
    )
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
    expect(
      cache.readQuery<OperationCommunityMySettingsQuery>({
        query: CommunityMySettingsDocument,
        variables: { communityId: "community-1" },
      })?.community?.mySettings,
    ).toMatchObject({
      accentColor: "#AABBCC",
      alias: "New alias",
    })
  })

  it("keeps a confirmed Community independent when another Context's mutation fails late", async () => {
    const pending = new Map<
      string,
      (data: Record<string, unknown>, errors?: GraphQLError[]) => void
    >()
    const link = new ApolloLink(
      (operation) =>
        new Observable((observer) => {
          const id = operation.variables.input.communityId as string
          pending.set(id, (data, errors) => {
            observer.next({ data, errors })
            observer.complete()
          })
        }),
    )
    const cache = new InMemoryCache()
    for (const [id, color] of [
      ["community-a", "#112233"],
      ["community-b", "#445566"],
    ]) {
      cache.writeQuery({
        query: CommunityMySettingsDocument,
        variables: { communityId: id },
        data: {
          community: {
            __typename: "Community",
            id,
            mySettings: settings(color, "Old alias"),
          },
        },
      })
    }
    const client = new ApolloClient({ cache, link })
    const older = client.mutate({
      mutation: UpdateCommunitySettingsDocument,
      variables: { input: { communityId: "community-a", accentColor: "#AABBCC" } },
      fetchPolicy: "no-cache",
      errorPolicy: "all",
    })
    const newer = client.mutate({
      mutation: UpdateCommunitySettingsDocument,
      variables: { input: { communityId: "community-b", accentColor: "#CCDDEE" } },
      fetchPolicy: "no-cache",
      errorPolicy: "all",
    })
    expect(pending.size).toBe(2)
    pending.get("community-b")?.({
      updateCommunitySettings: {
        __typename: "UpdateCommunitySettingsSuccess",
        settings: settings("#CCDDEE", "Old alias"),
      },
    })
    const newerResult = await newer
    const newerOutcome = requireSettingsMutationOutcome(
      newerResult.data?.updateCommunitySettings, newerResult,
    )
    expect(newerOutcome.__typename).toBe("UpdateCommunitySettingsSuccess")
    if (newerOutcome.__typename === "UpdateCommunitySettingsSuccess")
      commitCommunitySettingsPatch(cache, "community-b", {
        accentColor: newerOutcome.settings.accentColor,
      })
    pending.get("community-a")?.(
      { updateCommunitySettings: null },
      [new GraphQLError("redacted", { extensions: { code: "INTERNAL_SERVER_ERROR" } })],
    )
    const olderResult = await older
    try {
      requireSettingsMutationOutcome(
        olderResult.data?.updateCommunitySettings, olderResult,
      )
      throw new Error("Old Context response unexpectedly confirmed")
    } catch (error) {
      expect(classifySettingsSaveFailure(error)).toBe("unknown")
    }
    const read = (id: string) =>
      cache.readQuery<OperationCommunityMySettingsQuery>({
        query: CommunityMySettingsDocument,
        variables: { communityId: id },
      })?.community?.mySettings
    expect(read("community-a")).toMatchObject({
      accentColor: "#112233", alias: "Old alias",
    })
    expect(read("community-b")).toMatchObject({
      accentColor: "#CCDDEE", alias: "Old alias",
    })
  })

})

describe("Community Preferencesの本番Save AdapterとApollo Cache", () => {
  it("Accent・Aliasの並行応答と古いQueryを隔離し、明示照会の採用だけを確定反映する", async () => {
    const cache = createApolloCache()
    const community = (accent: string, alias: string | null) => ({
      community: { __typename: "Community", id: "community-1", mySettings: settings(accent, alias) },
    })
    const mutation = (accent: string, alias: string | null) => ({
      updateCommunitySettings: { __typename: "UpdateCommunitySettingsSuccess", settings: settings(accent, alias) },
    })
    const variables = { communityId: "community-1" }
    cache.writeQuery({ query: CommunityMySettingsDocument, variables, data: community("#112233", "Old alias") })
    cache.writeQuery({ query: CommunityMySettingsDocument, variables: { communityId: "community-2" },
      data: { community: { __typename: "Community", id: "community-2", mySettings: settings("#778899", "Other") } } })
    const pending: Array<{ name: string; finish: (data: Record<string, unknown>) => void }> = []
    const link = new ApolloLink(operation => new Observable(observer => {
      pending.push({ name: operation.operationName, finish: data => {
        observer.next({ data })
        observer.complete()
      } })
    }))
    const client = new ApolloClient({
      cache, link: ApolloLink.from([createSettingsCacheReadProtectionLink(cache), link]),
    })
    const root = createRoot(document.createElement("div"))
    let operations!: ReturnType<typeof useCommunityPreferencesSave>
    let alias!: ReturnType<typeof useCommunityAliasSave>
    const Harness = () => {
      operations = useCommunityPreferencesSave("community-1")
      alias = useCommunityAliasSave("community-1")
      return null
    }
    const read = (communityId = "community-1") => cache.readQuery<OperationCommunityMySettingsQuery>({
      query: CommunityMySettingsDocument, variables: { communityId },
    })?.community?.mySettings
    try {
      await act(async () => root.render(createElement(ApolloProvider, { client, children: createElement(Harness) })))
      const old = client.query({ query: CommunityMySettingsDocument, variables, fetchPolicy: "network-only" })
      const inspection = operations.observe()
      const accent = operations.save({ accentColor: "#AABBCC" })
      let aliasSave!: ReturnType<typeof alias.saveAlias>
      act(() => { aliasSave = alias.saveAlias(null) })
      expect(pending.map(entry => entry.name)).toEqual([
        "CommunityMySettings", "CommunityMySettings", "UpdateCommunitySettings", "UpdateCommunitySettings",
      ])
      await act(async () => {
        pending[3].finish(mutation("#112233", null))
        await expect(aliasSave).resolves.toEqual({ kind: "success", value: null })
      })
      pending[2].finish(mutation("#AABBCC", "Old alias"))
      await expect(accent).resolves.toMatchObject({ kind: "success" })
      pending[0].finish(community("#112233", "Old alias"))
      await old
      expect(read()).toMatchObject({ accentColor: "#AABBCC", alias: null })
      expect(read("community-2")).toMatchObject({ accentColor: "#778899", alias: "Other" })
      pending[1].finish(community("#445566", "Observed alias"))
      await expect(inspection).resolves.toEqual({ accentColor: "#445566" })
      expect(read()).toMatchObject({ accentColor: "#AABBCC", alias: null })
      operations.confirm({ accentColor: "#445566" })
      expect(read()).toMatchObject({ accentColor: "#445566", alias: null })
      expect(operations.isAccentConfirmed?.("#445566")).toBe(true)
      const fresh = client.query({ query: CommunityMySettingsDocument, variables, fetchPolicy: "network-only" })
      pending[4].finish(community("#556677", "Fresh alias"))
      await fresh
      expect(read()).toMatchObject({ accentColor: "#556677", alias: "Fresh alias" })
    } finally {
      await act(async () => root.unmount())
      client.stop()
    }
  })
})
