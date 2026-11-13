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
  SettingsInputValidationError,
  classifySettingsSaveFailure,
} from "@/infrastructure/graphql/settingsMutationResult"
import { createActionAdapter, type ActionOutcome } from "@/ui/Action"
import type { UserPreferences, UserPreferencesPatch } from "./userPreferences"
import { toGraphqlUserPreferencesPatch } from "./userPreferencesGraphqlAdapter"
import { classifyPersonalPreferencesMutationResult } from "./classifyPersonalPreferencesMutationResult"
import type {
  PreferencesSaveRejection,
  SavePersonalPreferencesAction,
} from "./preferencesSaveOutcome"

/**
 * PreferencesのMutationをActionOutcomeに分類する。
 * 既存SessionのException I/Fは移行期間中の互換境界として残す。
 */
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
  ): ActionOutcome<UserPreferences, PreferencesSaveRejection> => {
    const kind = classifySettingsSaveFailure(error)
    if (kind === "blocked") return { kind: "rejected", reason: { kind, error } }
    if (kind === "retryable") return { kind: "rejected", reason: { kind } }
    // ErrorのみでのValidation扱いはTyped Violationが欠けるため採用しない。
    return { kind: "unknown" }
  }

  const classify = (
    response: Awaited<ReturnType<typeof execute>>,
  ): ActionOutcome<UserPreferences, PreferencesSaveRejection> => {
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

  const savePreferences = async (patch: UserPreferencesPatch): Promise<UserPreferences> => {
    const outcome = await savePreferencesAction(patch)
    if (outcome.kind === "success") return outcome.value
    if (outcome.kind === "unknown") throw new Error("Preferences update unconfirmed")
    switch (outcome.reason.kind) {
      case "validation":
        throw new SettingsInputValidationError(outcome.reason.violations)
      case "blocked":
        throw outcome.reason.error
      case "retryable":
        throw { kind: "retryable" }
    }
  }

  return { savePreferences, savePreferencesAction }
}
