/**
 * Public code -> UI guidance for an operation that has already been
 * classified as blocked. This module never decides whether a write succeeded.
 */
export type ProfileBlockedFeedback = {
  title: string
  description: string
}

const messages = {
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

type PublicCode = keyof typeof messages

function getCodes(error: unknown): string[] {
  if (!error || typeof error !== "object") return []
  const source =
    "graphQLErrors" in error ? error.graphQLErrors :
    "errors" in error ? error.errors : undefined
  if (!Array.isArray(source)) return []

  return source.map((item: unknown) => {
    if (!item || typeof item !== "object" || !("extensions" in item)) return ""
    const extensions = item.extensions
    return extensions && typeof extensions === "object" && "code" in extensions &&
      typeof extensions.code === "string" ? extensions.code : ""
  })
}

export function getProfileBlockedFeedback(
  error: unknown,
  fallbackDescription =
    "現在の状態では保存を続けられません。ページを再読み込みして、プロフィールの状態を確認してください。",
): ProfileBlockedFeedback {
  const codes = getCodes(error)
  const code = codes[0]
  if (
    code &&
    codes.every((candidate) => candidate === code) &&
    Object.prototype.hasOwnProperty.call(messages, code)
  ) {
    return messages[code as PublicCode]
  }
  return { title: "プロフィールを変更できません", description: fallbackDescription }
}
