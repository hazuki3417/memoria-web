"use client"

import { useApolloClient } from "@apollo/client"
import {
  PersonalSettingsProfileDocument,
  PersonalSettingsPreferencesDocument,
  type OperationPersonalSettingsProfileQuery,
  type OperationPersonalSettingsPreferencesQuery,
} from "@/infrastructure/graphql/generated"
import { fromGraphqlUserPreferences } from "./preferences/userPreferencesGraphqlAdapter"

/** Authoritative inspections must not overwrite confirmed cache snapshots. */
export function usePersonalSettingsInspection() {
  const client = useApolloClient()
  return {
    inspectProfile: async () => {
      const result = await client.query<OperationPersonalSettingsProfileQuery>({
        query: PersonalSettingsProfileDocument,
        fetchPolicy: "no-cache",
      })
      if (!result.data?.me) throw new Error("Current User unavailable")
      return result.data.me.profile.nickname
    },
    inspectPreferences: async () => {
      const result = await client.query<OperationPersonalSettingsPreferencesQuery>({
        query: PersonalSettingsPreferencesDocument,
        fetchPolicy: "no-cache",
      })
      if (!result.data?.me) throw new Error("Current User unavailable")
      return fromGraphqlUserPreferences(result.data.me.preferences)
    },
  }
}
