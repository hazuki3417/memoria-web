"use client"

import { useApolloClient } from "@apollo/client"
import {
  CurrentUserDocument,
  PersonalSettingsAccentDocument,
  PersonalSettingsPreferencesDocument,
  SaveUserPreferencesDocument,
  type OperationSaveUserPreferencesMutation,
  type OperationSaveUserPreferencesMutationVariables,
} from "@/infrastructure/graphql/generated"
import {
  SettingsInputValidationError,
  requireSettingsMutationOutcome,
} from "@/infrastructure/graphql/settingsMutationResult"
import type { UserPreferencesPatch } from "./userPreferences"
import { AutoSaveActionError } from "@/ui/AutoSave"
import { resolvePreferencesAutoSaveFailure } from "./resolvePreferencesAutoSaveFailure"
import {
  fromGraphqlUserPreferences,
  toGraphqlUserPreferencesPatch,
} from "./userPreferencesGraphqlAdapter"

/** Preferences保存と確定した値の返却を所有する。 */
export function usePersonalPreferencesSave() {
  const client = useApolloClient()

  return {
    savePreferences: async (patch: UserPreferencesPatch) => {
      try {
      const input = toGraphqlUserPreferencesPatch(patch)
      const result = await client.mutate<
        OperationSaveUserPreferencesMutation,
        OperationSaveUserPreferencesMutationVariables
      >({ mutation: SaveUserPreferencesDocument, variables: { input }, errorPolicy: "all" })
      const outcome = requireSettingsMutationOutcome(result.data?.updateUserPreferences, result)
      if (outcome?.__typename === "InputValidationFailure")
        throw new SettingsInputValidationError(outcome.violations)
      if (outcome?.__typename !== "UpdateUserPreferencesSuccess")
        throw new Error("Preferences update unconfirmed")
      const confirmed = fromGraphqlUserPreferences(outcome.preferences)
      // A follow-up Query failure cannot turn an already confirmed Mutation
      // into an unknown outcome or trigger a duplicate settings write.
      void client
        .refetchQueries({
          include: [CurrentUserDocument, PersonalSettingsAccentDocument, PersonalSettingsPreferencesDocument],
        })
        .catch(() => undefined)
      return confirmed
      } catch (error) {
        throw new AutoSaveActionError(resolvePreferencesAutoSaveFailure(error))
      }
    },
  }
}
