/** GraphQLと認証失敗の区別だけを担当し、表示文言はUIが所有する。 */
export function isBlockingRegistrationError(error: unknown): boolean {
  if (typeof error !== "object" || error === null) return false
  const failure = error as {
    networkError?: { statusCode?: number }
    graphQLErrors?: Array<{ extensions?: { code?: string } }>
  }
  return (
    failure.networkError?.statusCode === 401 ||
    failure.graphQLErrors?.some(
      (item) => item.extensions?.code === "UNAUTHENTICATED",
    ) === true
  )
}
