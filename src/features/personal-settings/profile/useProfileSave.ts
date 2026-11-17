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
import { createActionAdapter, type ActionOutcome } from "@/ui/Action"
import { classifyProfileMutationResult } from "./classifyProfileMutationResult"
import type { ProfileSaveRejection, SaveProfile } from "./profileSaveOutcome"

/** Profile保存のMutation結果を分類し、確定後の更新を接続する。 */
export const useProfileSave = () => {
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
    if (result) return classifyProfileMutationResult(result)
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

  /** Nicknameの保存操作を提供する。 */
  return { saveProfile }
}
