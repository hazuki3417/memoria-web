/** UI copy based on public GraphQL error codes, never raw server messages. */
export type PreferencesBlockedFeedback = { title: string; description: string }

const GENERIC: PreferencesBlockedFeedback = {
  title: "設定を変更できません",
  description: "現在の状態では設定を更新できません。ログイン状態や権限を確認してください。",
}

export function getPreferencesBlockedFeedback(error: unknown): PreferencesBlockedFeedback {
  if (typeof error !== "object" || error === null) return GENERIC
  const list = "graphQLErrors" in error && Array.isArray(error.graphQLErrors)
    ? error.graphQLErrors
    : "errors" in error && Array.isArray(error.errors) ? error.errors : []
  const codes = list.map((item: unknown) => {
    if (typeof item !== "object" || item === null || !("extensions" in item))
      return null
    const extensions = item.extensions
    return typeof extensions === "object" && extensions !== null &&
      "code" in extensions && typeof extensions.code === "string"
      ? extensions.code : null
  })
  if (codes.length === 0 || codes.some((code) => code !== codes[0]))
    return GENERIC
  switch (codes[0]) {
    case "UNAUTHENTICATED":
      return {
        title: "ログインが必要です",
        description: "現在のログイン状態では設定を保存できません。もう一度ログインして状態を確認してください。",
      }
    case "USER_REGISTRATION_REQUIRED":
      return {
        title: "アカウント登録が必要です",
        description: "設定を保存するにはアカウントの登録を完了してください。",
      }
    case "USER_DELETING":
      return {
        title: "アカウントの削除処理中です",
        description: "削除処理中のため設定を変更できません。保存を繰り返さずアカウントの状態を確認してください。",
      }
    case "FORBIDDEN":
      return {
        title: "設定を変更できません",
        description: "この操作を行う権限がありません。現在のアカウントや権限を確認してください。",
      }
    case "NOT_FOUND":
      return {
        title: "設定を確認できません",
        description: "現在の状態では設定を更新できません。ページを再読み込みして状態を確認してください。",
      }
    default:
      return GENERIC
  }
}
