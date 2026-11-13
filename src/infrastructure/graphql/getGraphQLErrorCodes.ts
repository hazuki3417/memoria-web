/** GraphQL Errorのextensions.codeを安全に抽出し、不明な項目はnullとして保持する。 */
export const getGraphQLErrorCodes = (errors: readonly unknown[]): Array<string | null> => {
  return errors.map((item) => {
    if (!item || typeof item !== "object" || !("extensions" in item)) return null
    const extensions = item.extensions
    return extensions && typeof extensions === "object" && "code" in extensions &&
      typeof extensions.code === "string"
      ? extensions.code
      : null
  })
}
