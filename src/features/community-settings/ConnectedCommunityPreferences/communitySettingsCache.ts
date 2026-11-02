import type { ApolloCache } from "@apollo/client"
import {
  CommunitySettingsCacheFragmentDoc,
  type OperationCommunitySettingsCacheFragment,
} from "@/infrastructure/graphql/generated"

/** Only the fields in the successful mutation's input are authoritative. */
export function commitCommunitySettingsPatch(
  cache: ApolloCache<unknown>,
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
