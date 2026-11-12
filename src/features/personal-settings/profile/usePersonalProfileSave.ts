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
export const usePersonalProfileSave = () => {
  const client = useApolloClient()
  const [updateProfile] = useUpdateMemoriaUserProfileMutation()

  const classifyBlocked = (error: unknown): ActionOutcome<string, ProfileSaveRejection> => {
    const kind = classifySettingsSaveFailure(error)
    if (kind === "blocked") return { kind: "rejected", reason: { kind, error } }
    if (kind === "retryable") return { kind: "rejected", reason: { kind } }
    return { kind: "unknown" }
  }

  const execute = (nickname: string) => {
    return updateProfile({
      variables: { input: { nickname } },
      errorPolicy: "all",
    })
  }

  const classify = (
    response: Awaited<ReturnType<typeof execute>>,
  ): ActionOutcome<string, ProfileSaveRejection> => {
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
  }

  const afterSuccess = async () => {
    await client.refetchQueries({
      include: [CurrentUserDocument, PersonalSettingsProfileDocument],
    })
  }

  const saveProfile: SaveProfile = createActionAdapter({
    execute,
    classify,
    classifyError: classifyBlocked,
    afterSuccess,
  })

  const inspectProfile = async (): Promise<string> => {
    const result = await client.query<OperationPersonalSettingsProfileQuery>({
      query: PersonalSettingsProfileDocument,
      fetchPolicy: "no-cache",
    })
    if (!result.data?.me) throw new Error("Current profile unavailable")
    return result.data.me.profile.nickname
  }

  return { saveProfile, inspectProfile }
}
