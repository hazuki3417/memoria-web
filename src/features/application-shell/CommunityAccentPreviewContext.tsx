"use client"

import {
  releaseCommunityAccentPreview,
  type CommunityAccentPreview,
} from "./communityAccentPreview"
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react"

type CommunityAccentPreviewContextValue = {
  previews: Record<string, NonNullable<CommunityAccentPreview>>
  setPreview: (communityId: string, color: string) => number
  clearPreview: (communityId: string, owner: number) => void
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
  const [previews, setCurrentPreviews] = useState<
    Record<string, NonNullable<CommunityAccentPreview>>
  >({})
  const nextOwner = useRef(0)
  const setPreview = useCallback((communityId: string, color: string) => {
    const owner = ++nextOwner.current
    setCurrentPreviews((current) => ({
      ...current,
      [communityId]: { communityId, color, owner },
    }))
    return owner
  }, [])
  const clearPreview = useCallback((communityId: string, owner: number) => {
    setCurrentPreviews((current) => {
      if (
        !current[communityId] ||
        releaseCommunityAccentPreview(
          current[communityId],
          communityId,
          owner,
        ) !== null
      )
        return current
      const updated = { ...current }
      delete updated[communityId]
      return updated
    })
  }, [])
  const value = useMemo(
    () => ({ previews, setPreview, clearPreview }),
    [previews, setPreview, clearPreview],
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

