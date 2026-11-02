"use client"

import { useApolloClient } from "@apollo/client"
import {
  CurrentUserDocument,
  SaveUserPreferencesDocument,
  type OperationSaveUserPreferencesMutation,
  type OperationSaveUserPreferencesMutationVariables,
  useUpdateMemoriaUserProfileMutation,
} from "@/infrastructure/graphql/generated"
import type { UserPreferencesPatch } from "./preferences/userPreferences"
import {
  fromGraphqlUserPreferences,
  toGraphqlUserPreferencesPatch,
} from "./preferences/userPreferencesGraphqlAdapter"

/** Owns Personal Settings writes; reading and presentation remain separate. */
export function usePersonalSettingsActions() {
  const client = useApolloClient()
  const [updateProfile] = useUpdateMemoriaUserProfileMutation()

  return {
    saveProfile: async (nickname: string) => {
      await updateProfile({
        variables: { input: { nickname } },
        refetchQueries: [CurrentUserDocument],
        awaitRefetchQueries: true,
      })
    },
    savePreferences: async (patch: UserPreferencesPatch) => {
      const input = toGraphqlUserPreferencesPatch(patch)
      const result = await client.mutate<
        OperationSaveUserPreferencesMutation,
        OperationSaveUserPreferencesMutationVariables
      >({ mutation: SaveUserPreferencesDocument, variables: { input } })
      if (!result.data?.updateUserPreferences.preferences)
        throw new Error("Preferences update unconfirmed")
      const confirmed = fromGraphqlUserPreferences(
        result.data.updateUserPreferences.preferences,
      )
      // A follow-up Query failure cannot turn an already confirmed Mutation
      // into an unknown outcome or trigger a duplicate settings write.
      void client.refetchQueries({
        include: [CurrentUserDocument],
      }).catch(() => undefined)
      return confirmed
    },
  }
}
