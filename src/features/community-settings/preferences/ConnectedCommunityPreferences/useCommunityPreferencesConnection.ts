"use client"

import { useEffect } from "react"
import { useApolloClient } from "@apollo/client"
import {
  useCommunityAccentPreview,
  useCommunityAccentSave,
} from "@/features/application-shell/CommunityAccentPreviewContext"
import { useCommunitySettingsRefreshError } from "../../useCommunitySettingsRefreshError"
import { commitCommunitySettingsPatch } from "./communitySettingsCache"
import { SettingsInputValidationError, requireSettingsMutationOutcome } from "@/infrastructure/graphql/settingsMutationResult"
import {
  CommunityMySettingsDocument,
  UpdateCommunitySettingsDocument,
  type OperationUpdateCommunitySettingsMutation,
  type OperationUpdateCommunitySettingsMutationVariables,
  useCommunityMySettingsQuery,
} from "@/infrastructure/graphql/generated"

const isHex = (value: string) => /^#[0-9a-fA-F]{6}$/.test(value)

/** Owns the Community preferences query, saving session and Apollo cache synchronization. */
export function useCommunityPreferencesConnection(communityId: string) {
  const { data, loading, error } = useCommunityMySettingsQuery({
    variables: { communityId },
    fetchPolicy: "cache-and-network",
  })
  useCommunitySettingsRefreshError(Boolean(data?.community && error))
  const client = useApolloClient()
  const { setPreview, clearPreview } = useCommunityAccentPreview()
  const { snapshot, controller } = useCommunityAccentSave(communityId)

  useEffect(() => {
    const color = data?.community?.mySettings.accentColor
    if (color) controller.initialize(communityId, color)
  }, [communityId, data, controller])

  useEffect(() => {
    controller.configure(communityId, {
      save: async (next) => {
        // The session queue must survive the settings view unmount.
        // ApolloClient.mutate is independent of the useMutation hook lifetime.
        const result = await client.mutate<
          OperationUpdateCommunitySettingsMutation,
          OperationUpdateCommunitySettingsMutationVariables
        >({
          mutation: UpdateCommunitySettingsDocument,
          fetchPolicy: "no-cache",
          errorPolicy: "all",
          variables: { input: { communityId, accentColor: next } },
        })
        const outcome = requireSettingsMutationOutcome(result.data?.updateCommunitySettings, result)
        if (outcome?.__typename === "InputValidationFailure")
          throw new SettingsInputValidationError(outcome.violations)
        const confirmed =
          outcome?.__typename === "UpdateCommunitySettingsSuccess"
            ? outcome.settings.accentColor
            : undefined
        if (!confirmed || !isHex(confirmed))
          throw new Error("Accent save response invalid")
        commitCommunitySettingsPatch(client.cache, communityId, {
          accentColor: confirmed.toUpperCase(),
        })
        return confirmed
      },
      observe: async () => {
        const result = await client.query({
          query: CommunityMySettingsDocument,
          variables: { communityId },
          // Inspection must not mutate a newer confirmed cache snapshot.
          fetchPolicy: "no-cache",
        })
        const current = result.data?.community?.mySettings.accentColor
        if (!current || !isHex(current))
          throw new Error("Community accent unavailable")
        return current
      },
      confirm: (color) =>
        commitCommunitySettingsPatch(client.cache, communityId, {
          accentColor: color,
        }),
      preview: (value) => setPreview(communityId, value),
      release: (owner) => clearPreview(communityId, owner),
    })
  })

  const canResave = Boolean(snapshot.draft && isHex(snapshot.draft))
  return { data, loading, snapshot, controller, canResave }
}
