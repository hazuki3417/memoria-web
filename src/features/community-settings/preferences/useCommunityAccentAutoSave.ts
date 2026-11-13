"use client"

import { useCallback, useEffect, useState, useSyncExternalStore } from "react"
import { useApolloClient } from "@apollo/client"
import { useCommunityAccentPreview } from "@/features/application-shell/CommunityAccentPreviewContext"
import {
  CommunityMySettingsDocument,
  UpdateCommunitySettingsDocument,
  type OperationUpdateCommunitySettingsMutation,
  type OperationUpdateCommunitySettingsMutationVariables,
} from "@/infrastructure/graphql/generated"
import { SettingsInputValidationError, requireSettingsMutationOutcome } from "@/infrastructure/graphql/settingsMutationResult"
import { commitCommunitySettingsPatch } from "./communitySettingsCache"
import { createCommunityAccentSaveController } from "./communityAccentSaveController"

const isHex = (value: string) => /^#[0-9a-fA-F]{6}$/.test(value)

/**
 * One Ready view owns its short-lived Queue, draft and explicit recovery.
 * The mutation closure retains its fixed Community ID and living Apollo client
 * after unmount, while preview and all form-local state are released.
 */
export function useCommunityAccentAutoSave(communityId: string, initialAccent: string) {
  const client = useApolloClient()
  const { setPreview, clearPreview } = useCommunityAccentPreview()
  const [controller, setController] = useState(createCommunityAccentSaveController)

  const subscribe = useCallback((listener: () => void) => controller.subscribe(listener), [controller])
  const getSnapshot = useCallback(() => controller.getSnapshot(), [controller])
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getSnapshot)

  useEffect(() => {
    controller.configure({
      save: async (next) => {
        // ApolloClient.mutate is independent of a view-mounted useMutation hook.
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
        const confirmed = outcome?.__typename === "UpdateCommunitySettingsSuccess"
          ? outcome.settings.accentColor : undefined
        if (!confirmed || !isHex(confirmed)) throw new Error("Accent save response invalid")
        // A confirmed write remains authoritative even after this view unmounts.
        try {
          commitCommunitySettingsPatch(client.cache, communityId, { accentColor: confirmed.toUpperCase() })
        } catch {
          // Cache synchronization failure does not undo a confirmed Mutation.
          void client.refetchQueries({ include: [CommunityMySettingsDocument] }).catch(() => undefined)
        }
        return confirmed
      },
      observe: async () => {
        const result = await client.query({
          query: CommunityMySettingsDocument,
          variables: { communityId },
          fetchPolicy: "no-cache",
        })
        const current = result.data?.community?.mySettings.accentColor
        if (!current || !isHex(current)) throw new Error("Community accent unavailable")
        return current
      },
      confirm: (color) => {
        try {
          commitCommunitySettingsPatch(client.cache, communityId, { accentColor: color })
        } catch {
          void client.refetchQueries({ include: [CommunityMySettingsDocument] }).catch(() => undefined)
        }
      },
      preview: (value) => setPreview(communityId, value),
      release: (owner) => clearPreview(communityId, owner),
    })
    controller.initialize(initialAccent)
  }, [controller, communityId, initialAccent, client, setPreview, clearPreview])

  useEffect(() => {
    // React Strict Mode replays mount cleanup; a closed Queue cannot be reopened.
    if (controller.isClosed()) {
      setController(createCommunityAccentSaveController())
      return
    }
    return () => { void controller.close() }
  }, [controller])

  const canResave = Boolean(snapshot.draft && isHex(snapshot.draft))
  return { controller, snapshot, canResave }
}
