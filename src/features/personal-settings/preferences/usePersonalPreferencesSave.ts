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
  SettingsGraphQLExecutionError,
  classifySettingsSaveFailure,
} from "@/infrastructure/graphql/settingsMutationResult"
import { createActionAdapter, type ActionOutcome } from "@/ui/Action"
import type { UserPreferences, UserPreferencesPatch } from "./userPreferences"
import { toGraphqlUserPreferencesPatch } from "./userPreferencesGraphqlAdapter"
import { classifyPersonalPreferencesMutationResult } from "./classifyPersonalPreferencesMutationResult"
import type {
  PersonalPreferencesSaveRejection,
  SavePersonalPreferencesAction,
} from "./personalPreferencesSaveOutcome"

/** PreferencesのMutationをTyped ActionOutcomeに分類する。 */
export function usePersonalPreferencesSave() {
  const client = useApolloClient()

  const execute = (patch: UserPreferencesPatch) =>
    client.mutate<
      OperationSaveUserPreferencesMutation,
      OperationSaveUserPreferencesMutationVariables
    >({
      mutation: SaveUserPreferencesDocument,
      variables: { input: toGraphqlUserPreferencesPatch(patch) },
      errorPolicy: "all",
    })

  const classifyError = (
    error: unknown,
  ): ActionOutcome<UserPreferences, PersonalPreferencesSaveRejection> => {
    const kind = classifySettingsSaveFailure(error)
    if (kind === "blocked") return { kind: "rejected", reason: { kind, error } }
    if (kind === "retryable") return { kind: "rejected", reason: { kind } }
    // ErrorのみでのValidation扱いはTyped Violationが欠けるため採用しない。
    return { kind: "unknown" }
  }

  const classify = (
    response: Awaited<ReturnType<typeof execute>>,
  ): ActionOutcome<UserPreferences, PersonalPreferencesSaveRejection> => {
    const result = response.data?.updateUserPreferences
    if (result) return classifyPersonalPreferencesMutationResult(result)
    if (response.errors?.length) {
      return classifyError(new SettingsGraphQLExecutionError(response.errors))
    }
    return { kind: "unknown" }
  }

  const afterSuccess = () => {
    // Mutationの確定Successと後続Queryの成否を混同しない。
    return client.refetchQueries({
      include: [
        CurrentUserDocument,
        PersonalSettingsAccentDocument,
        PersonalSettingsPreferencesDocument,
      ],
    }).then(() => undefined)
  }

  const savePreferencesAction: SavePersonalPreferencesAction = createActionAdapter({
    execute,
    classify,
    classifyError,
    afterSuccess,
  })

  return { savePreferencesAction }
}
