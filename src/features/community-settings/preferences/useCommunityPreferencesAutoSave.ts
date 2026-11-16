"use client"

import { useCallback, useEffect, useState, useSyncExternalStore } from "react"
import { useCommunityAccentPreview } from "@/features/application-shell/CommunityAccentPreviewContext"
import { useCommunityPreferencesSave } from "./useCommunityPreferencesSave"
import { createCommunityPreferencesSaveController } from "./communityPreferencesSaveController"

const isHex = (value: string) => /^#[0-9a-fA-F]{6}$/.test(value)

/**
 * One Ready view owns its short-lived Queue, draft and explicit recovery.
 * The mutation closure retains its fixed Community ID and living Apollo client
 * after unmount, while preview and all form-local state are released.
 */
export const useCommunityPreferencesAutoSave = (communityId: string, initialAccent: string) => {
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
    controller.initialize(initialAccent)
  }, [controller, communityId, initialAccent, operations, setPreview, clearPreview])

  useEffect(() => {
    // React Strict Mode replays mount cleanup; a closed Queue cannot be reopened.
    if (controller.isClosed()) {
      setController(createCommunityPreferencesSaveController())
      return
    }
    return () => { void controller.close() }
  }, [controller])

  const canResave = Boolean(snapshot.draft && isHex(snapshot.draft))
  return { controller, snapshot, canResave }
}
