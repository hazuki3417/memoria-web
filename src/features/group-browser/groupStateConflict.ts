/** Only the public GraphQL conflict code is authoritative. */
export function isGroupStateConflict(error: unknown): boolean {
  if (!error || typeof error !== "object" || !("graphQLErrors" in error))
    return false
  const gqlErrors = error.graphQLErrors
  return (
    Array.isArray(gqlErrors) &&
    gqlErrors.some(
      (item: unknown) =>
        item !== null &&
        typeof item === "object" &&
        "extensions" in item &&
        item.extensions !== null &&
        typeof item.extensions === "object" &&
        "code" in item.extensions &&
        item.extensions.code === "CONFLICT",
    )
  )
}

/** A transport failure cannot prove whether the mutation committed. */
export function isGroupUpdateOutcomeUnknown(error: unknown): boolean {
  if (!error || typeof error !== "object") return false
  if ("networkError" in error && error.networkError != null) return true
  if (
    "graphQLErrors" in error &&
    Array.isArray(error.graphQLErrors) &&
    error.graphQLErrors.length > 0
  )
    return false
  return error instanceof Error
}

/** Create may have committed even when its response could not be confirmed. */
export function isGroupCreateOutcomeUnknown(error: unknown): boolean {
  if (isGroupUpdateOutcomeUnknown(error)) return true
  if (!error || typeof error !== "object" || !("graphQLErrors" in error))
    return false
  const graphQLErrors = error.graphQLErrors
  return (
    Array.isArray(graphQLErrors) &&
    graphQLErrors.some(
      (item: unknown) =>
        item !== null &&
        typeof item === "object" &&
        "extensions" in item &&
        item.extensions !== null &&
        typeof item.extensions === "object" &&
        "code" in item.extensions &&
        item.extensions.code === "UNKNOWN_OUTCOME",
    )
  )
}
