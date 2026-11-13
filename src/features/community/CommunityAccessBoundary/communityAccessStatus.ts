/** A missing/inaccessible Community must not be confused with a transport failure. */
export type CommunityAccessStatus =
  | "loading"
  | "ready"
  | "unavailable"
  | "error"
  | "unauthenticated"

function graphqlCodes(error: unknown): string[] {
  if (!error || typeof error !== "object" || !("graphQLErrors" in error))
    return []
  const errors = error.graphQLErrors
  if (!Array.isArray(errors)) return []
  return errors.flatMap((item: unknown): string[] => {
    if (!item || typeof item !== "object" || !("extensions" in item))
      return []
    const extensions = item.extensions
    if (
      !extensions ||
      typeof extensions !== "object" ||
      !("code" in extensions) ||
      typeof extensions.code !== "string"
    )
      return []
    return [extensions.code]
  })
}

export function getCommunityAccessStatus({
  loading,
  error,
  communityId,
  result,
}: {
  loading: boolean
  error: unknown
  communityId: string
  result: { community?: { id: string } | null } | undefined
}): CommunityAccessStatus {
  // Old Apollo data must not make pages visible during a new verification.
  if (loading) return "loading"
  if (error) {
    const codes = graphqlCodes(error)
    // An unknown or mixed failure cannot safely establish non-membership.
    if (codes.length !== 1) return "error"
    if (codes[0] === "UNAUTHENTICATED") return "unauthenticated"
    if (codes[0] === "NOT_FOUND" || codes[0] === "FORBIDDEN")
      return "unavailable"
    return "error"
  }
  if (!result || result.community === undefined) return "error"
  if (result.community === null) return "unavailable"
  return result.community.id === communityId ? "ready" : "error"
}
