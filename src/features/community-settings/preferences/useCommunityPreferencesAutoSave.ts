"use client"

import { useCallback, useEffect, useState, useSyncExternalStore } from "react"
import { useCommunityAccentPreview } from "@/features/application-shell/CommunityAccentPreviewContext"
import { useCommunityPreferencesSave } from "./useCommunityPreferencesSave"
import { createCommunityPreferencesSaveController } from "./communityPreferencesSaveController"

import { isCommunityAccentColor, type CommunityPreferencesValues } from "./communityPreferences"

/** Ready画面の生存期間に限り保存Controllerを所有し、離脱時にQueueを閉じる。 */
export const useCommunityPreferencesAutoSave = (communityId: string, initialPreferences: CommunityPreferencesValues) => {
  const operations = useCommunityPreferencesSave(communityId)
  const { setPreview, clearPreview } = useCommunityAccentPreview()
  const [controller, setController] = useState(createCommunityPreferencesSaveController)

  const subscribe = useCallback((listener: () => void) => controller.subscribe(listener), [controller])
  const getSnapshot = useCallback(() => controller.getSnapshot(), [controller])
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getSnapshot)

  useEffect(() => {
    controller.configure({
      ...operations,
      preview: (value) => setPreview(communityId, value),
      release: (owner) => clearPreview(communityId, owner),
    })
    controller.initialize(initialPreferences)
  }, [controller, communityId, initialPreferences, operations, setPreview, clearPreview])

  useEffect(() => {
    // React Strict Mode replays mount cleanup; a closed Queue cannot be reopened.
    if (controller.isClosed()) {
      setController(createCommunityPreferencesSaveController())
      return
    }
    return () => { void controller.close() }
  }, [controller])

  const canResave = Boolean(snapshot.draft && isCommunityAccentColor(snapshot.draft.accentColor))
  // Ready画面に保存状態とユーザーによるRecovery操作を提供する。
  return { controller, snapshot, canResave }
}
