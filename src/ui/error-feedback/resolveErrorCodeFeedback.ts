/** 同一の公開エラーコードに対応する案内を選び、不明・混在時は安全なFallbackを返す。 */
export const resolveErrorCodeFeedback = <Feedback>(
  codes: readonly (string | null)[],
  messages: Readonly<Record<string, Feedback>>,
  fallback: Feedback,
): Feedback => {
  const code = codes[0]
  if (
    code &&
    codes.every((candidate) => candidate === code) &&
    Object.hasOwn(messages, code)
  ) {
    return messages[code]
  }
  return fallback
}
