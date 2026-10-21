/** Only the public GraphQL conflict code is authoritative. */
export function isGroupStateConflict(error: unknown): boolean {
  if (!error || typeof error !== "object" || !("graphQLErrors" in error)) return false
  const gqlErrors = error.graphQLErrors
  return Array.isArray(gqlErrors) && gqlErrors.some(
    (item: unknown) => item !== null &&
      typeof item === "object" &&
      "extensions" in item &&
      item.extensions !== null &&
      typeof item.extensions === "object" &&
      "code" in item.extensions &&
      item.extensions.code === "CONFLICT",
  )
}
