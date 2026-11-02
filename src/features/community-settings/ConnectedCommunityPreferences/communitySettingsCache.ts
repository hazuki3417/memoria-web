import type { ApolloCache, NormalizedCacheObject } from "@apollo/client"
import {
  CommunitySettingsCacheFragmentDoc,
  type OperationCommunitySettingsCacheFragment,
} from "@/infrastructure/graphql/generated"

/** Only the fields in the successful mutation's input are authoritative. */
export function commitCommunitySettingsPatch(
  cache: ApolloCache<NormalizedCacheObject>,
  communityId: string,
  patch: Partial<OperationCommunitySettingsCacheFragment["mySettings"]>,
) {
  const id = cache.identify({ __typename: "Community", id: communityId })
  if (!id) return
  const previous = cache.readFragment<OperationCommunitySettingsCacheFragment>({
    id,
    fragment: CommunitySettingsCacheFragmentDoc,
  })
  if (!previous) return
  const settings = { ...previous.mySettings }
  // Undefined means the field was not confirmed by the Mutation.
  // Null remains an explicit Alias removal.
  if (patch.accentColor !== undefined) settings.accentColor = patch.accentColor
  if (patch.alias !== undefined) settings.alias = patch.alias
  cache.writeFragment({
    id,
    fragment: CommunitySettingsCacheFragmentDoc,
    data: {
      __typename: "Community",
      mySettings: {
        ...settings,
        __typename: "CommunitySettings",
      },
    },
  })
}
