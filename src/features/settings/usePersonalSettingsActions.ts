"use client"

import {
  CurrentUserDocument,
  useSaveUserPreferencesMutation,
  useUpdateMemoriaUserProfileMutation,
} from "@/infrastructure/graphql/generated"
import type { UserPreferencesPatch } from "./preferences/userPreferences"
import {
  fromGraphqlUserPreferences,
  toGraphqlUserPreferencesPatch,
} from "./preferences/userPreferencesGraphqlAdapter"

/** Owns Personal Settings writes; reading and presentation remain separate. */
export function usePersonalSettingsActions() {
  const [updateProfile] = useUpdateMemoriaUserProfileMutation()
  const [updatePreferences] = useSaveUserPreferencesMutation()

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
      const result = await updatePreferences({
        variables: { input },
        refetchQueries: [CurrentUserDocument],
        awaitRefetchQueries: true,
      })
      if (!result.data?.updateUserPreferences.preferences)
        throw new Error("Preferences update unconfirmed")
      return fromGraphqlUserPreferences(
        result.data.updateUserPreferences.preferences,
      )
    },
  }
}
