"use client"

import { useApolloClient } from "@apollo/client"
import {
  CurrentUserDocument,
  type OperationCurrentUserQuery,
} from "@/infrastructure/graphql/generated"
import { fromGraphqlUserPreferences } from "./preferences/userPreferencesGraphqlAdapter"

/**
 * Inspect the authoritative CurrentUser without publishing a potentially
 * stale observation to the shared Apollo cache.
 */
export function usePersonalSettingsInspection() {
  const client = useApolloClient()
  const readCurrentUser = async () => {
    const current = await client.query<OperationCurrentUserQuery>({
      query: CurrentUserDocument,
      fetchPolicy: "no-cache",
    })
    if (!current.data?.me) throw new Error("Current User unavailable")
    return current.data.me
  }

  return {
    inspectProfile: async () => (await readCurrentUser()).profile.nickname,
    inspectPreferences: async () =>
      fromGraphqlUserPreferences((await readCurrentUser()).preferences),
  }
}
