/** Uses only public GraphQL codes; server error details must not leak to UI. */
export function getCommunityBlockedFeedback(
  error: unknown,
  target: "Community名" | "Community別名" | "Community設定",
): { title: string; description: string } {
  if (typeof error !== "object" || error === null) {
    return generic(target)
  }
  const list =
    "graphQLErrors" in error && Array.isArray(error.graphQLErrors)
      ? error.graphQLErrors
      : "errors" in error && Array.isArray(error.errors)
        ? error.errors
        : []
  const codes = list.map((item: unknown) => {
    if (typeof item !== "object" || item === null || !("extensions" in item))
      return null
    const ext = item.extensions
    return typeof ext === "object" && ext !== null &&
      "code" in ext && typeof ext.code === "string"
      ? ext.code : null
  })
  if (codes.length === 0 || codes.some((code) => code !== codes[0]))
    return generic(target)

  switch (codes[0]) {
    case "UNAUTHENTICATED":
      return {
        title: "ログインが必要です",
        description: `現在のログイン状態では${target}を更新できません。もう一度ログインしてから状態を確認してください。`,
      }
    case "USER_REGISTRATION_REQUIRED":
      return {
        title: "アカウント登録が必要です",
        description: `${target}を変更するにはアカウントの登録を完了してください。`,
      }
    case "USER_DELETING":
      return {
        title: "アカウントの削除処理中です",
        description: `削除処理中のため${target}を変更できません。保存を繰り返さずアカウントの状態を確認してください。`,
      }
    case "FORBIDDEN":
      return {
        title: `${target}を変更できません`,
        description: "この操作を行う権限がありません。Communityでの役割や現在の権限を確認してください。",
      }
    case "NOT_FOUND":
      return {
        title: `${target}を確認できません`,
        description: "現在の状態では更新できません。Communityの存在や参加状態を確認してください。",
      }
    default:
      return generic(target)
  }
}
function generic(target: string) {
  return {
    title: `${target}を変更できません`,
    description:
      "現在の状態では保存できません。権限とアカウントの状態を確認してください。",
  }
}
