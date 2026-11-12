"use client"

import { useApolloClient } from "@apollo/client"
import {
  CurrentUserDocument,
  PersonalSettingsProfileDocument,
  type OperationPersonalSettingsProfileQuery,
  useUpdateMemoriaUserProfileMutation,
} from "@/infrastructure/graphql/generated"
import {
  SettingsGraphQLExecutionError,
  classifySettingsSaveFailure,
} from "@/infrastructure/graphql/settingsMutationResult"
import { createActionAdapter, type ActionOutcome } from "@/ui/Action"
import type { ProfileSaveRejection, SaveProfile } from "./profileSaveOutcome"

/** Only the GraphQL Operation-specific details belong to this adapter. */
export function usePersonalProfileSave() {
  const client = useApolloClient()
  const [updateProfile] = useUpdateMemoriaUserProfileMutation()

  function classifyBlocked(error: unknown): ActionOutcome<string, ProfileSaveRejection> {
    const kind = classifySettingsSaveFailure(error)
    if (kind === "blocked") return { kind: "rejected", reason: { kind, error } }
    if (kind === "retryable") return { kind: "rejected", reason: { kind } }
    return { kind: "unknown" }
  }

  const saveProfile: SaveProfile = createActionAdapter({
    execute: (nickname: string) =>
      updateProfile({
        variables: { input: { nickname } },
        errorPolicy: "all",
      }),
    classify: (response): ActionOutcome<string, ProfileSaveRejection> => {
      const result = response.data?.updateUserProfile
      if (result?.__typename === "UpdateUserProfileSuccess") {
        return { kind: "success", value: result.user.profile.nickname }
      }
      if (result?.__typename === "InputValidationFailure") {
        return {
          kind: "rejected",
          reason: { kind: "validation", violations: result.violations },
        }
      }
      if (response.errors?.length) {
        return classifyBlocked(new SettingsGraphQLExecutionError(response.errors))
      }
      return { kind: "unknown" }
    },
    classifyError: classifyBlocked,
    // This is deliberately outside confirmed operation classification.
    afterSuccess: () => client.refetchQueries({
      include: [CurrentUserDocument, PersonalSettingsProfileDocument],
    }).then(() => undefined),
  })

  async function inspectProfile(): Promise<string> {
    const result = await client.query<OperationPersonalSettingsProfileQuery>({
      query: PersonalSettingsProfileDocument,
      fetchPolicy: "no-cache",
    })
    if (!result.data?.me) throw new Error("Current profile unavailable")
    return result.data.me.profile.nickname
  }

  return { saveProfile, inspectProfile }
}
