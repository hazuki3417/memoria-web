"use client"

import { releaseCommunityAccentPreview, type CommunityAccentPreview } from "./communityAccentPreview"
import { createCommunityAccentSaveController } from "@/features/community-settings/communityAccentSaveController"

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react"

type CommunityAccentPreviewContextValue = {
  previews: Record<string, NonNullable<CommunityAccentPreview>>
  setPreview: (communityId: string, color: string) => number
  clearPreview: (communityId: string, owner: number) => void
  saveController: ReturnType<typeof createCommunityAccentSaveController>
}

const CommunityAccentPreviewContext =
  createContext<CommunityAccentPreviewContextValue | null>(null)

/**
 * The preview belongs to the authenticated Application Shell, not Apollo's
 * confirmed server cache. It survives route changes only while its owner
 * is mounted, and can never leak across Community IDs.
 */
export function CommunityAccentPreviewProvider({
  children,
}: {
  children: ReactNode
}) {
  const [previews, setCurrentPreviews] = useState<Record<string, NonNullable<CommunityAccentPreview>>>({})
  const saveController = useRef(createCommunityAccentSaveController()).current
  const nextOwner = useRef(0)
  const setPreview = useCallback((communityId: string, color: string) => {
    const owner = ++nextOwner.current
    setCurrentPreviews((current) => ({ ...current, [communityId]: { communityId, color, owner } }))
    return owner
  }, [])
  const clearPreview = useCallback((communityId: string, owner: number) => {
    setCurrentPreviews((current) => {
      if (!current[communityId] ||
        releaseCommunityAccentPreview(current[communityId], communityId, owner) !== null) return current
      const updated = { ...current }
      delete updated[communityId]
      return updated
    })
  }, [])
  const value = useMemo(
    () => ({ previews, setPreview, clearPreview, saveController }),
    [previews, setPreview, clearPreview, saveController],
  )

  return (
    <CommunityAccentPreviewContext.Provider value={value}>
      {children}
    </CommunityAccentPreviewContext.Provider>
  )
}

export function useCommunityAccentPreview() {
  const context = useContext(CommunityAccentPreviewContext)
  if (!context) {
    throw new Error("CommunityAccentPreviewProvider is required")
  }
  return context
}

/** Observe one Community only, without binding its queue to the settings route. */
export function useCommunityAccentSave(communityId: string) {
  const { saveController } = useCommunityAccentPreview()
  const subscribe = useCallback(
    (listener: () => void) => saveController.subscribe(communityId, listener),
    [saveController, communityId],
  )
  const getSnapshot = useCallback(
    () => saveController.getSnapshot(communityId),
    [saveController, communityId],
  )
  return {
    snapshot: useSyncExternalStore(subscribe, getSnapshot, getSnapshot),
    controller: saveController,
  }
}
