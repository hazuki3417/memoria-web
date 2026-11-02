"use client"

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react"

type AccentPreview = { communityId: string; color: string } | null

type CommunityAccentPreviewContextValue = {
  preview: AccentPreview
  setPreview: (communityId: string, color: string) => void
  clearPreview: (communityId: string) => void
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
  const [preview, setCurrentPreview] = useState<AccentPreview>(null)
  const setPreview = useCallback((communityId: string, color: string) => {
    setCurrentPreview({ communityId, color })
  }, [])
  const clearPreview = useCallback((communityId: string) => {
    setCurrentPreview((current) =>
      current?.communityId === communityId ? null : current,
    )
  }, [])
  const value = useMemo(
    () => ({ preview, setPreview, clearPreview }),
    [preview, setPreview, clearPreview],
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
