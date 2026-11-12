"use client"

import { useApolloClient } from "@apollo/client"
import {
  CurrentUserDocument,
  PersonalSettingsProfileDocument,
  useUpdateMemoriaUserProfileMutation,
} from "@/infrastructure/graphql/generated"
import {
  SettingsGraphQLExecutionError,
  classifySettingsSaveFailure,
} from "@/infrastructure/graphql/settingsMutationResult"
import type { SaveProfile } from "./profileSaveOutcome"

/** Classifies the typed operation result and keeps follow-up Query separate. */
export function usePersonalProfileSave() {
  const client = useApolloClient()
  const [updateProfile] = useUpdateMemoriaUserProfileMutation()

  const saveProfile: SaveProfile = async (nickname) => {
    try {
      const response = await updateProfile({
        variables: { input: { nickname } },
        errorPolicy: "all",
      })

      const result = response.data?.updateUserProfile
      if (result?.__typename === "InputValidationFailure") {
        return {
          kind: "rejected",
          reason: { kind: "validation", violations: result.violations },
        }
      }
      if (result?.__typename !== "UpdateUserProfileSuccess") {
        // Missing/unknown result, even alongside GraphQL errors, is not proof
        // that this operation did not execute.
        return { kind: "unknown" }
      }

      // The mutation succeeded. Query synchronization is a separate action;
      // a failed refetch must not change the mutation outcome.
      void client
        .refetchQueries({ include: [CurrentUserDocument, PersonalSettingsProfileDocument] })
        .catch(() => undefined)

      return { kind: "success", value: undefined }
    } catch (error) {
      if (error instanceof SettingsGraphQLExecutionError) {
        return { kind: "unknown" }
      }

      // Explicitly blocking authorization/account state errors can stop
      // further operation. Other transport failures are always unconfirmed.
      const kind = classifySettingsSaveFailure(error)
      if (kind === "blocked") {
        return { kind: "rejected", reason: { kind, error } }
      }
      if (kind === "retryable") {
        // Used only when an adapter explicitly guarantees non-execution.
        return { kind: "rejected", reason: { kind } }
      }
      return { kind: "unknown" }
    }
  }

  return { saveProfile }
}
