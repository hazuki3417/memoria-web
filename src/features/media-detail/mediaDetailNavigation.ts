/**
 * URL/History helpers for Media Detail. These pure functions are intentionally
 * independent of Next Router, browser globals and data/visual components.
 */
export type MediaDetailOrigin = Readonly<{
  pathname: string
  searchWithoutMediaId: string
  hash: string
}>
export type MediaNavigationSnapshot = Readonly<{
  ids: readonly string[]
  origin: MediaDetailOrigin
}>
export type MediaDetailNavigation = Readonly<{
  position: number | null
  count: number | null
  previousId: string | null
  nextId: string | null
}>

export function getMediaDetailId(search: string): string | null {
  const params = new URLSearchParams(search.startsWith("?") ? search.slice(1) : search)
  const ids = params.getAll("mediaId")
  if (ids.length !== 1) return null
  const id = ids[0].trim()
  return id && id === ids[0] ? id : null
}

export function mediaDetailUrl(
  pathname: string,
  search: string,
  hash: string,
  mediaId: string | null,
): string {
  const params = new URLSearchParams(search.startsWith("?") ? search.slice(1) : search)
  params.delete("mediaId")
  if (mediaId) params.set("mediaId", mediaId)
  const query = params.toString()
  return `${pathname}${query ? `?${query}` : ""}${hash}`
}

export function createMediaNavigationSnapshot(
  orderedLoadedMediaIds: readonly string[],
  openedMediaId: string,
  origin: MediaDetailOrigin,
): MediaNavigationSnapshot {
  if (!openedMediaId || !orderedLoadedMediaIds.includes(openedMediaId)) {
    throw new Error("The opened Media ID must be in the visible collection")
  }
  if (orderedLoadedMediaIds.some((id) => !id || id.trim() !== id)) {
    throw new Error("Media IDs must be non-empty and normalized")
  }
  const unique = new Set(orderedLoadedMediaIds)
  if (unique.size !== orderedLoadedMediaIds.length) {
    throw new Error("Media navigation IDs must be unique")
  }
  return Object.freeze({ ids: Object.freeze([...orderedLoadedMediaIds]), origin: Object.freeze({ ...origin }) })
}

export function getMediaNavigation(
  snapshot: MediaNavigationSnapshot | null,
  currentId: string | null,
  wrap: boolean,
): MediaDetailNavigation {
  if (!snapshot || !currentId) {
    return { position: null, count: null, previousId: null, nextId: null }
  }
  const position = snapshot.ids.indexOf(currentId)
  if (position < 0) {
    return { position: null, count: snapshot.ids.length, previousId: null, nextId: null }
  }
  const count = snapshot.ids.length
  return {
    position,
    count,
    previousId: position > 0 ? snapshot.ids[position - 1] : wrap && count > 1 ? snapshot.ids[count - 1] : null,
    nextId: position < count - 1 ? snapshot.ids[position + 1] : wrap && count > 1 ? snapshot.ids[0] : null,
  }
}

export function isMediaDetailRoute(pathname: string): boolean {
  return /^\/(?:dashboard|media|groups)(?:\/|$)/.test(pathname) ||
    /^\/communities\/[^/]+\/(?:dashboard|media|groups)(?:\/|$)/.test(pathname)
}
