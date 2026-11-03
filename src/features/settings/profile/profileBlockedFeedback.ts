/** Public GraphQL codes carry meaning; never copy server error messages into UI. */
export type ProfileBlockedFeedback = {
  title: string
  description: string
}

const BLOCKED_FEEDBACK = {
  UNAUTHENTICATED: {
    title: "ログインが必要です",
    description:
      "現在のログイン状態ではプロフィールを更新できません。もう一度ログインしてから、プロフィールを確認してください。",
  },
  USER_REGISTRATION_REQUIRED: {
    title: "アカウント登録が必要です",
    description:
      "プロフィールを変更するにはアカウントの登録を完了してください。登録済みの場合は、現在の状態を確認してください。",
  },
  USER_DELETING: {
    title: "アカウントの削除処理中です",
    description:
      "削除処理中のためプロフィールは更新できません。保存操作を繰り返さず、アカウントの状態を確認してください。",
  },
  FORBIDDEN: {
    title: "プロフィールを変更できません",
    description:
      "この操作を行う権限がありません。現在のアカウントや権限を確認してください。",
  },
  NOT_FOUND: {
    title: "プロフィールを確認できません",
    description:
      "現在の状態ではプロフィールを更新できません。ページを再読み込みして状態を確認してください。",
  },
} as const satisfies Record<string, ProfileBlockedFeedback>

type ProfileBlockedCode = keyof typeof BLOCKED_FEEDBACK

const GENERIC_FEEDBACK: ProfileBlockedFeedback = {
  title: "プロフィールを変更できません",
  description:
    "現在の状態では保存を続けられません。ページを再読み込みして、プロフィールの状態を確認してください。",
}

function publicGraphqlCodes(error: unknown): Array<string | null> {
  if (typeof error !== "object" || error === null) return []
  const errors =
    "graphQLErrors" in error && Array.isArray(error.graphQLErrors)
      ? error.graphQLErrors
      : "errors" in error && Array.isArray(error.errors)
        ? error.errors
        : []
  return errors.map((item: unknown) => {
    if (typeof item !== "object" || item === null || !("extensions" in item))
      return null
    const extensions = item.extensions
    if (
      typeof extensions !== "object" ||
      extensions === null ||
      !("code" in extensions)
    )
      return null
    return typeof extensions.code === "string" ? extensions.code : null
  })
}

/**
 * A mixed list of errors cannot be assigned a single specific explanation.
 * The caller must first establish the blocked classification.
 */
export function getProfileBlockedFeedback(
  error: unknown,
  fallbackDescription?: string,
): ProfileBlockedFeedback {
  const codes = publicGraphqlCodes(error)
  const code = codes[0]
  if (
    code !== undefined &&
    code !== null &&
    codes.every((candidate) => candidate === code) &&
    Object.prototype.hasOwnProperty.call(BLOCKED_FEEDBACK, code)
  ) {
    return BLOCKED_FEEDBACK[code as ProfileBlockedCode]
  }
  return {
    ...GENERIC_FEEDBACK,
    description: fallbackDescription ?? GENERIC_FEEDBACK.description,
  }
}
