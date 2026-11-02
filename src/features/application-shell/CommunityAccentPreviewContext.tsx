"use client"

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react"

type AccentPreview = { communityId: string; color: string; owner: number } | null

type CommunityAccentPreviewContextValue = {
  preview: AccentPreview
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
  const [preview, setCurrentPreview] = useState<AccentPreview>(null)
  const nextOwner = useRef(0)
  const setPreview = useCallback((communityId: string, color: string) => {
    const owner = ++nextOwner.current
    setCurrentPreview({ communityId, color, owner })
    return owner
  }, [])
  const clearPreview = useCallback((communityId: string, owner: number) => {
    setCurrentPreview((current) =>
      current?.communityId === communityId && current.owner === owner
        ? null
        : current,
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
