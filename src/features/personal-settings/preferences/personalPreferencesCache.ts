import type { ApolloCache } from "@apollo/client"
import { protectConfirmedSettingsPatch } from "@/infrastructure/graphql/settingsCacheReadProtection"
import type { PersonalPreferencesPatch } from "./personalPreferences"

/** 確定したFieldのみを対象Userの既存設定へ反映する。未取得Entityは生成しない。 */
export const commitPersonalPreferencesPatch = (
  cache: ApolloCache<object>,
  userId: string,
  patch: PersonalPreferencesPatch,
): boolean => {
  const id = cache.identify({ __typename: "User", id: userId })
  if (!id) return false
  const fields = Object.fromEntries(Object.entries(patch).filter(([, value]) => value !== undefined))
  if (!Object.keys(fields).length) return true
  protectConfirmedSettingsPatch(cache, "User", userId, fields)
  let applied = false
  cache.modify({
    id,
    fields: {
      preferences(existing, { isReference }) {
        if (!existing || typeof existing !== "object" || isReference(existing) || Array.isArray(existing)) return existing
        // 取得済みの他Fieldは保持し、boolean falseも明示値として扱う。
        applied = true
        return { ...existing, ...fields }
      },
    },
  })
  return applied
}
