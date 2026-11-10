"use client"

import { useApolloClient } from "@apollo/client"
import {
  CurrentUserDocument,
  useUpdateMemoriaUserProfileMutation,
} from "@/infrastructure/graphql/generated"
import {
  SettingsInputValidationError,
  requireSettingsMutationOutcome,
} from "@/infrastructure/graphql/settingsMutationResult"

/** Profile保存と確定後のCurrentUser再取得を所有する。 */
export function usePersonalProfileSave() {
  const client = useApolloClient()
  const [updateProfile] = useUpdateMemoriaUserProfileMutation()

  return {
    saveProfile: async (nickname: string) => {
      const result = await updateProfile({
        variables: { input: { nickname } },
        errorPolicy: "all",
      })
      const outcome = requireSettingsMutationOutcome(result.data?.updateUserProfile, result)
      if (outcome?.__typename === "InputValidationFailure")
        throw new SettingsInputValidationError(outcome.violations)
      if (outcome?.__typename !== "UpdateUserProfileSuccess")
        throw new Error("Profile update unconfirmed")
      void client
        .refetchQueries({ include: [CurrentUserDocument] })
        .catch(() => undefined)
    },
  }
}
