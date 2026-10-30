"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react"
import { usePathname } from "next/navigation"
import {
  createMediaNavigationSnapshot,
  getMediaDetailId,
  getMediaNavigation,
  isMediaDetailRoute,
  mediaDetailUrl,
  type MediaNavigationSnapshot,
  type MediaDetailNavigation,
} from "./mediaDetailNavigation"

type ActiveSession = {
  token: string
  snapshot: MediaNavigationSnapshot
}
type MediaDetailUrlContextValue = {
  selectedMediaId: string | null
  snapshot: MediaNavigationSnapshot | null
  navigation: MediaDetailNavigation
  openMediaDetail(input: {
    mediaId: string
    orderedLoadedMediaIds: readonly string[]
  }): void
  closeMediaDetail(): void
  navigateMediaDetail(direction: -1 | 1, wrap?: boolean): void
}

const Context = createContext<MediaDetailUrlContextValue | null>(null)
const SESSION_MARKER = "__memoriaMediaDetailSession"

/**
 * Mounted once in the authenticated Application Shell.
 * Only owns URL and in-app navigation history, never GraphQL or viewer state.
 * Visual host and consumer migration are intentionally a later review checkpoint.
 */
export function MediaDetailUrlProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const session = useRef<ActiveSession | null>(null)
  const [selectedMediaId, setSelectedMediaId] = useState<string | null>(null)
  const [snapshot, setSnapshot] = useState<MediaNavigationSnapshot | null>(null)

  useEffect(() => {
    const syncUrl = () => {
      const current = window.location
      if (!isMediaDetailRoute(current.pathname)) {
        session.current = null
        setSnapshot(null)
        setSelectedMediaId(null)
        return
      }
      const selected = getMediaDetailId(current.search)
      setSelectedMediaId(selected)
      if (!selected || !session.current ||
          session.current.snapshot.origin.pathname !== current.pathname ||
          window.history.state?.[SESSION_MARKER] !== session.current.token) {
        session.current = null
        setSnapshot(null)
      }
    }
    syncUrl()
    window.addEventListener("popstate", syncUrl)
    return () => window.removeEventListener("popstate", syncUrl)
  }, [pathname])

  const openMediaDetail = useCallback((input: {
    mediaId: string
    orderedLoadedMediaIds: readonly string[]
  }) => {
    const { pathname, search, hash } = window.location
    if (!isMediaDetailRoute(pathname) || new URLSearchParams(search).has("mediaId")) return
    const origin = { pathname, searchWithoutMediaId: search, hash }
    const nextSnapshot = createMediaNavigationSnapshot(
      input.orderedLoadedMediaIds,
      input.mediaId,
      origin,
    )
    const token = crypto.randomUUID()
    session.current = { token, snapshot: nextSnapshot }
    setSnapshot(nextSnapshot)
    const href = mediaDetailUrl(pathname, search, hash, input.mediaId)
    // Preserve Next.js history metadata rather than replacing its history state.
    window.history.pushState(
      { ...window.history.state, [SESSION_MARKER]: token },
      "",
      href,
    )
    setSelectedMediaId(input.mediaId)
  }, [])

  const closeMediaDetail = useCallback(() => {
    const { pathname, search, hash } = window.location
    const active = session.current
    const safeBack = active !== null &&
      active.snapshot.origin.pathname === pathname &&
      window.history.state?.[SESSION_MARKER] === active.token
    session.current = null
    setSnapshot(null)
    setSelectedMediaId(null)
    if (safeBack) {
      window.history.back()
    } else {
      window.history.replaceState(
        { ...window.history.state },
        "",
        mediaDetailUrl(pathname, search, hash, null),
      )
    }
  }, [])

  const navigateMediaDetail = useCallback((direction: -1 | 1, wrap = false) => {
    const active = session.current
    if (!active) return
    const { pathname, search, hash } = window.location
    if (pathname !== active.snapshot.origin.pathname ||
        window.history.state?.[SESSION_MARKER] !== active.token) return
    const currentId = getMediaDetailId(search)
    const nav = getMediaNavigation(active.snapshot, currentId, wrap)
    const nextId = direction === -1 ? nav.previousId : nav.nextId
    if (!nextId || nextId === currentId) return
    window.history.replaceState(
      { ...window.history.state },
      "",
      mediaDetailUrl(pathname, search, hash, nextId),
    )
    setSelectedMediaId(nextId)
  }, [])

  const navigation = useMemo(
    () => getMediaNavigation(snapshot, selectedMediaId, false),
    [snapshot, selectedMediaId],
  )
  const value = useMemo(
    () => ({
      selectedMediaId,
      snapshot,
      navigation,
      openMediaDetail,
      closeMediaDetail,
      navigateMediaDetail,
    }),
    [selectedMediaId, snapshot, navigation, openMediaDetail, closeMediaDetail, navigateMediaDetail],
  )
  return <Context.Provider value={value}>{children}</Context.Provider>
}

export function useMediaDetailUrl(): MediaDetailUrlContextValue {
  const value = useContext(Context)
  if (!value) throw new Error("MediaDetailUrlProvider is missing")
  return value
}
