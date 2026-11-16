import { ApolloClient, ApolloLink, ApolloProvider, Observable } from "@apollo/client"
import { act, createElement } from "react"
import { createRoot } from "react-dom/client"
import { describe, expect, it } from "vitest"
import { createApolloCache } from "@/infrastructure/graphql/createApolloCache"
import { createSettingsCacheReadProtectionLink } from "@/infrastructure/graphql/settingsCacheReadProtection"
import { CurrentUserDocument, PersonalSettingsPreferencesDocument, type OperationCurrentUserQuery } from "@/infrastructure/graphql/generated"
import { defaultPersonalPreferences, type PersonalPreferencesPatch } from "./personalPreferences"
import { usePersonalPreferencesSave } from "./usePersonalPreferencesSave"

const preferences = (patch: PersonalPreferencesPatch = {}) => ({
  __typename: "UserPreferences", ...defaultPersonalPreferences, ...patch,
})
const user = (patch: PersonalPreferencesPatch = {}) => ({
  me: { __typename: "User", id: "user-1",
    profile: { __typename: "UserProfile", nickname: "User" },
    preferences: preferences(patch) },
})
const mutation = (patch: PersonalPreferencesPatch) => ({
  updateUserPreferences: { __typename: "UpdateUserPreferencesSuccess", preferences: preferences(patch) },
})

describe("Personal Preferencesの本番Save AdapterとApollo Cache", () => {
  it("確定FieldだけをPatchし、旧Queryと明示照会を分離する", async () => {
    const cache = createApolloCache()
    cache.writeQuery({ query: CurrentUserDocument, data: user() })
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
    let actions!: ReturnType<typeof usePersonalPreferencesSave>
    const Harness = () => {
      actions = usePersonalPreferencesSave("user-1")
      return null
    }
    const read = () => cache.readQuery<OperationCurrentUserQuery>({ query: CurrentUserDocument })?.me?.preferences
    try {
      await act(async () => root.render(createElement(ApolloProvider, { client, children: createElement(Harness) })))
      const old = client.query({ query: PersonalSettingsPreferencesDocument, fetchPolicy: "network-only" })
      const observed = actions.observe()
      const saving = actions.save({ personalAccentColor: "#AABBCC", fileSizeUnit: "BINARY" })
      expect(pending.map(entry => entry.name)).toEqual([
        "PersonalSettingsPreferences", "PersonalSettingsPreferences", "SaveUserPreferences",
      ])
      pending[2].finish(mutation({ personalAccentColor: "#AABBCC", fileSizeUnit: "BINARY", mediaThumbnailSize: "LARGE" }))
      await expect(saving).resolves.toMatchObject({ kind: "success" })
      expect(read()).toMatchObject({ personalAccentColor: "#AABBCC", fileSizeUnit: "BINARY", mediaThumbnailSize: "MEDIUM" })
      pending[0].finish(user({ mediaThumbnailSize: "SMALL" }))
      await old
      expect(read()).toMatchObject({ personalAccentColor: "#AABBCC", fileSizeUnit: "BINARY", mediaThumbnailSize: "SMALL" })
      pending[1].finish(user({ personalAccentColor: "#445566", fileSizeUnit: "DECIMAL" }))
      await expect(observed).resolves.toMatchObject({ personalAccentColor: "#445566", fileSizeUnit: "DECIMAL" })
      expect(read()).toMatchObject({ personalAccentColor: "#AABBCC", fileSizeUnit: "BINARY" })
      actions.confirm({ personalAccentColor: "#445566" })
      expect(read()).toMatchObject({ personalAccentColor: "#445566", fileSizeUnit: "BINARY" })
      expect(actions.isAccentConfirmed("#445566")).toBe(true)

      // 確定後に開始した通常Queryは新たなBackendの値を利用する。
      const fresh = client.query({ query: PersonalSettingsPreferencesDocument, fetchPolicy: "network-only" })
      pending[3].finish(user({ personalAccentColor: "#778899" }))
      await fresh
      expect(read()?.personalAccentColor).toBe("#778899")
    } finally {
      await act(async () => root.unmount())
      client.stop()
    }
  })
})
