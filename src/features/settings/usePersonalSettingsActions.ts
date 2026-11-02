"use client"

import { useApolloClient } from "@apollo/client"
import {
  CurrentUserDocument,
  SaveUserPreferencesDocument,
  type OperationSaveUserPreferencesMutation,
  type OperationSaveUserPreferencesMutationVariables,
  useUpdateMemoriaUserProfileMutation,
} from "@/infrastructure/graphql/generated"
import { SettingsInputValidationError } from "./graphqlSettingsResult"
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
      const result = await updateProfile({
        variables: { input: { nickname } },
      })
      const outcome = result.data?.updateUserProfile
      if (outcome?.__typename === "InputValidationFailure")
        throw new SettingsInputValidationError(outcome.violations)
      if (outcome?.__typename !== "UpdateUserProfileSuccess")
        throw new Error("Profile update unconfirmed")
      void client.refetchQueries({ include: [CurrentUserDocument] }).catch(() => undefined)
    },
    savePreferences: async (patch: UserPreferencesPatch) => {
      const input = toGraphqlUserPreferencesPatch(patch)
      const result = await client.mutate<
        OperationSaveUserPreferencesMutation,
        OperationSaveUserPreferencesMutationVariables
      >({ mutation: SaveUserPreferencesDocument, variables: { input } })
      const outcome = result.data?.updateUserPreferences
      if (outcome?.__typename === "InputValidationFailure")
        throw new SettingsInputValidationError(outcome.violations)
      if (outcome?.__typename !== "UpdateUserPreferencesSuccess")
        throw new Error("Preferences update unconfirmed")
      const confirmed = fromGraphqlUserPreferences(outcome.preferences)
      // A follow-up Query failure cannot turn an already confirmed Mutation
      // into an unknown outcome or trigger a duplicate settings write.
      void client.refetchQueries({
        include: [CurrentUserDocument],
      }).catch(() => undefined)
      return confirmed
    },
  }
}
