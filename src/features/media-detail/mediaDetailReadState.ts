/**
 * Pure projection of the Media Detail GraphQL result.
 * Keep all unresolved fields distinct from confirmed empty collections.
 */
export type DetailRecord = {
  id: string
  originalFileName: string
  fileSize: number
  uploadedAt: string
  uploader: { nickname: string | null; deleted: boolean } | null
  image: {
    width: number
    height: number
    variants: { width: number; height: number; url: string }[]
  } | null
  processing: { status: "PROCESSING" | "READY" | "FAILED" } | null
  groups?: { edges: { node: { id: string; name: string } }[]; pageInfo: { hasNextPage: boolean } } | null
  tags?: { edges: { node: { id: string; name: string } }[]; pageInfo: { hasNextPage: boolean } } | null
}
export type MediaDetailResult = { media: DetailRecord | null }
export type DetailReadState =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "retryable-error" }
  | { kind: "unavailable" }
  | { kind: "ready"; media: DetailRecord }
export type PreviewReadState =
  | { kind: "idle" | "detail-loading" | "processing" | "processing-failed" | "image-loading" | "unavailable" }
  | { kind: "detail-error" | "delivery-error"; retryable: true }
  | { kind: "ready"; url: string; width: number; height: number }
export type CollectionReadState =
  | { kind: "pending" | "error" | "incomplete" }
  | { kind: "ready"; values: { id: string; name: string }[] }

export function projectMediaDetail(
  mediaId: string | null,
  loading: boolean,
  data: MediaDetailResult | undefined,
  hasError: boolean,
): DetailReadState {
  if (!mediaId) return { kind: "idle" }
  // Apollo may temporarily expose a previous request's data.
  if (data?.media && data.media.id !== mediaId) return { kind: "loading" }
  if (loading && !data?.media) return { kind: "loading" }
  if (hasError && !data?.media) return { kind: "retryable-error" }
  if (!data) return { kind: "loading" }
  if (!data.media) return hasError ? { kind: "retryable-error" } : { kind: "unavailable" }
  return { kind: "ready", media: data.media }
}

export function projectPreview(detail: DetailReadState): PreviewReadState {
  switch (detail.kind) {
    case "idle": return { kind: "idle" }
    case "loading": return { kind: "detail-loading" }
    case "retryable-error": return { kind: "detail-error", retryable: true }
    case "unavailable": return { kind: "unavailable" }
    case "ready": {
      const { media } = detail
      if (media.processing?.status === "PROCESSING") return { kind: "processing" }
      if (media.processing?.status === "FAILED") return { kind: "processing-failed" }
      if (media.processing?.status !== "READY") return { kind: "delivery-error", retryable: true }
      const variants = media.image?.variants
        .filter((variant) => variant.url.length > 0 && variant.width > 0 && variant.height > 0)
        .sort((a, b) => a.width - b.width)
      const selected = variants?.at(-1)
      return selected
        ? { kind: "ready", url: selected.url, width: selected.width, height: selected.height }
        : { kind: "delivery-error", retryable: true }
    }
  }
}

export function projectCollection(
  detail: DetailReadState,
  collection: "groups" | "tags",
  hasPartialError: boolean,
): CollectionReadState {
  if (detail.kind !== "ready") return { kind: "pending" }
  if (hasPartialError || detail.media[collection] == null) return { kind: "error" }
  const result = detail.media[collection]
  if (result.pageInfo.hasNextPage) return { kind: "incomplete" }
  return { kind: "ready", values: result.edges.map((edge) => edge.node) }
}
