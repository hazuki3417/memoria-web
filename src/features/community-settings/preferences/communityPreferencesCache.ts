import type { ApolloCache } from "@apollo/client"
import { protectConfirmedSettingsPatch } from "@/infrastructure/graphql/settingsCacheReadProtection"
import type { OperationCommunitySettingsCacheFragment } from "@/infrastructure/graphql/generated"

/** 確定したFieldだけを対象Communityの既存設定へ反映する。未取得Entityは生成しない。 */
export const commitCommunitySettingsPatch = (
  cache: ApolloCache<object>,
  communityId: string,
  patch: Partial<Pick<OperationCommunitySettingsCacheFragment["mySettings"], "accentColor" | "alias">>,
): boolean => {
  const id = cache.identify({ __typename: "Community", id: communityId })
  if (!id) return false
  const fields = Object.fromEntries(Object.entries(patch).filter(([, value]) => value !== undefined))
  if (!Object.keys(fields).length) return true
  protectConfirmedSettingsPatch(cache, "Community", communityId, fields)
  let applied = false
  cache.modify({
    id,
    fields: {
      mySettings(existing, { isReference }) {
        if (!existing || typeof existing !== "object" || isReference(existing) || Array.isArray(existing)) return existing
        // Aliasの明示的なnull解除も保持する。
        applied = true
        return { ...existing, ...fields }
      },
    },
  })
  return applied
}
