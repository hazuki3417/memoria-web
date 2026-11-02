"use client"

import { releaseCommunityAccentPreview, type CommunityAccentPreview } from "./communityAccentPreview"

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react"

type CommunityAccentPreviewContextValue = {
  preview: CommunityAccentPreview
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
  const [preview, setCurrentPreview] = useState<CommunityAccentPreview>(null)
  const nextOwner = useRef(0)
  const setPreview = useCallback((communityId: string, color: string) => {
    const owner = ++nextOwner.current
    setCurrentPreview({ communityId, color, owner })
    return owner
  }, [])
  const clearPreview = useCallback((communityId: string, owner: number) => {
    setCurrentPreview((current) =>
      releaseCommunityAccentPreview(current, communityId, owner),
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
