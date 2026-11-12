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

/** The operation adapter owns Typed Result classification, not form UI state. */
export function usePersonalProfileSave() {
  const client = useApolloClient()
  const [updateProfile] = useUpdateMemoriaUserProfileMutation()

  const saveProfile: SaveProfile = async (nickname) => {
    let response: Awaited<ReturnType<typeof updateProfile>>
    try {
      response = await updateProfile({
        variables: { input: { nickname } },
        errorPolicy: "all",
      })
    } catch (error) {
      // Errors with no typed result are not proof the mutation was rejected.
      if (error instanceof SettingsGraphQLExecutionError) {
        return { kind: "unknown" }
      }
      const kind = classifySettingsSaveFailure(error)
      if (kind === "blocked") {
        return { kind: "rejected", reason: { kind, error } }
      }
      if (kind === "retryable") {
        // Only an explicit known-nonexecuted marker can be safely retryable.
        return { kind: "rejected", reason: { kind } }
      }
      return { kind: "unknown" }
    }

    const result = response.data?.updateUserProfile
    if (result?.__typename === "InputValidationFailure") {
      return {
        kind: "rejected",
        reason: { kind: "validation", violations: result.violations },
      }
    }
    if (result?.__typename !== "UpdateUserProfileSuccess") {
      return { kind: "unknown" }
    }

    // Query synchronization is a separate operation. Never change a confirmed
    // mutation success into unknown because a follow-up refresh failed.
    try {
      void client
        .refetchQueries({ include: [CurrentUserDocument, PersonalSettingsProfileDocument] })
        .catch(() => undefined)
    } catch {
      // The mutation is already confirmed; the existing refresh-error
      // boundary is responsible for any separately observable Query failure.
    }
    return { kind: "success", value: undefined }
  }

  return { saveProfile }
}
