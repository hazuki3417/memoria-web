"use client"

import { useApolloClient } from "@apollo/client"
import { settingsInspectionContext } from "@/infrastructure/graphql/settingsCacheReadProtection"
import { useMemo } from "react"
import {
  CurrentUserDocument,
  PersonalSettingsAccentDocument,
  PersonalSettingsPreferencesDocument,
  SaveUserPreferencesDocument,
  type OperationPersonalSettingsPreferencesQuery,
  type OperationPersonalSettingsAccentQuery,
  type OperationSaveUserPreferencesMutation,
  type OperationSaveUserPreferencesMutationVariables,
} from "@/infrastructure/graphql/generated"
import {
  SettingsGraphQLExecutionError,
  classifySettingsSaveFailure,
} from "@/infrastructure/graphql/settingsMutationResult"
import { createActionAdapter, type ActionOutcome } from "@/ui/Action"
import type { UserPreferences, UserPreferencesPatch } from "./userPreferences"
import { fromGraphqlUserPreferences, toGraphqlUserPreferencesPatch } from "./userPreferencesGraphqlAdapter"
import { commitPersonalPreferencesPatch } from "./personalPreferencesCache"
import { classifyPersonalPreferencesMutationResult } from "./classifyPersonalPreferencesMutationResult"
import type {
  PersonalPreferencesSaveRejection,
  SavePersonalPreferencesAction,
  PersonalPreferencesSaveOperations,
} from "./personalPreferencesSaveOutcome"

/** PreferencesのMutationをTyped ActionOutcomeに分類する。 */
export const usePersonalPreferencesSave = (userId?: string): PersonalPreferencesSaveOperations => {
  const client = useApolloClient()
  return useMemo(() => {
    const execute = (patch: UserPreferencesPatch) => {
      if (!userId) throw new Error("Current User unavailable")
      return client.mutate<
        OperationSaveUserPreferencesMutation,
        OperationSaveUserPreferencesMutationVariables
      >({
        mutation: SaveUserPreferencesDocument,
        variables: { input: toGraphqlUserPreferencesPatch(patch) },
        fetchPolicy: "no-cache",
        errorPolicy: "all",
      })
    }

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

    const confirmPreferences = (patch: UserPreferencesPatch) => {
      if (!userId) return
      try {
        if (commitPersonalPreferencesPatch(client.cache, userId, patch)) return
      } catch {
        // Cache同期失敗はMutation Outcomeから独立して扱う。
      }
      try {
        void client.refetchQueries({
          include: [CurrentUserDocument, PersonalSettingsAccentDocument, PersonalSettingsPreferencesDocument],
        }).catch(() => undefined)
      } catch {
        // 明示採用でもCache取得の失敗を遠隔保存結果と混同しない。
      }
    }

    const afterSuccess = (values: UserPreferences, attempted: UserPreferencesPatch) => {
      const patch: UserPreferencesPatch = {}
      for (const key of Object.keys(attempted) as Array<keyof UserPreferences>) {
        if (attempted[key] !== undefined) Object.assign(patch, { [key]: values[key] })
      }
      confirmPreferences(patch)
    }

    const inspectPreferences = async (): Promise<UserPreferences> => {
      const result = await client.query<OperationPersonalSettingsPreferencesQuery>({
        query: PersonalSettingsPreferencesDocument,
        fetchPolicy: "no-cache",
        context: settingsInspectionContext,
      })
      if (!userId || result.data?.me?.id !== userId) throw new Error("Current User unavailable")
      return fromGraphqlUserPreferences(result.data.me.preferences)
    }

    const isAccentConfirmed = (color: string) => {
      try {
        const current = client.cache.readQuery<OperationPersonalSettingsAccentQuery>({
          query: PersonalSettingsAccentDocument,
          returnPartialData: true,
        })?.me
        return Boolean(userId && current?.id === userId && current?.preferences?.personalAccentColor === color)
      } catch {
        return false
      }
    }

    const savePreferencesAction: SavePersonalPreferencesAction = createActionAdapter({
      execute,
      classify,
      classifyError,
      afterSuccess,
    })

    return { save: savePreferencesAction, observe: inspectPreferences, confirm: confirmPreferences, isAccentConfirmed }
  }, [client, userId])
}
