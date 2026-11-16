import { ApolloLink, Observable, type ApolloCache } from "@apollo/client"

type SettingsPatch = Record<string, unknown>
type Scope = "User" | "Community"
type ReadWindow = Map<string, SettingsPatch>

// 確定後に届く古い取得応答から、取得中に確定したFieldだけを保護する。
// 取得終了時にWindowを解放し、画面Draft・Unknown履歴・永続Sessionは保持しない。
const activeReads = new WeakMap<ApolloCache<object>, Set<ReadWindow>>()
const protectedQueries = new Set([
  "CurrentUser", "PersonalSettingsAccent", "PersonalSettingsPreferences", "PersonalUsage",
  "MyCommunities", "CommunityMySettings", "CommunitySettingsMembership", "CommunitySettingsUsage",
])

const scopeKey = (scope: Scope, id: string) => `${scope}:${id}`
const isRecord = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === "object" && !Array.isArray(value)

/** 確定したFieldを現在進行中の通常取得にだけ通知する。 */
export const protectConfirmedSettingsPatch = (
  cache: ApolloCache<object>,
  scope: Scope,
  id: string,
  patch: SettingsPatch,
) => {
  const key = scopeKey(scope, id)
  for (const window of activeReads.get(cache) ?? []) {
    window.set(key, { ...window.get(key), ...patch })
  }
}

const preserve = (
  value: unknown,
  scope: Scope,
  field: "preferences" | "mySettings",
  window: ReadWindow,
): unknown => {
  if (!isRecord(value) || typeof value.id !== "string" || !isRecord(value[field])) return value
  const patch = window.get(scopeKey(scope, value.id))
  if (!patch) return value
  // Queryが選択したFieldだけを保護し、nullの親Entityや未取得Fieldを生成しない。
  const selected = value[field]
  const confirmed = Object.fromEntries(
    Object.entries(patch).filter(([key]) => Object.hasOwn(selected, key)),
  )
  return { ...value, [field]: { ...selected, ...confirmed } }
}

/** 保存前に開始した通常Queryの投影と確定済みFieldを調停する。明示照会は生の応答を返す。 */
export const createSettingsCacheReadProtectionLink = (cache: ApolloCache<object>) =>
  new ApolloLink((operation, forward) => {
    if (!protectedQueries.has(operation.operationName) || operation.getContext().settingsInspection)
      return forward(operation)

    return new Observable(observer => {
      let reads = activeReads.get(cache)
      if (!reads) {
        reads = new Set()
        activeReads.set(cache, reads)
      }
      const window: ReadWindow = new Map()
      reads.add(window)
      const release = () => { reads.delete(window) }
      const subscription = forward(operation).subscribe({
        next: result => {
          if (!result.data || !window.size) {
            observer.next(result)
            return
          }
          const data = { ...result.data }
          if ("me" in data) data.me = preserve(data.me, "User", "preferences", window)
          if ("community" in data) data.community = preserve(data.community, "Community", "mySettings", window)
          if (Array.isArray(data.myCommunities))
            data.myCommunities = data.myCommunities.map(value => preserve(value, "Community", "mySettings", window))
          observer.next({ ...result, data })
        },
        error: error => { release(); observer.error(error) },
        complete: () => { release(); observer.complete() },
      })
      return () => { release(); subscription.unsubscribe() }
    })
  })

/** no-cache照会を通常取得とdedupせず、現在値の観測として扱う。 */
export const settingsInspectionContext = {
  settingsInspection: true,
  queryDeduplication: false,
} as const
