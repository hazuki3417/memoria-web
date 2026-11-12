import { getGraphQLErrorCodes } from "@/infrastructure/graphql/getGraphQLErrorCodes"
import { resolveErrorCodeFeedback } from "@/ui/error-feedback"

/** 保存継続不可と確定した公開エラーコードを、利用者向けの案内へ変換する。 */
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

/** GraphQLの公開エラーコードをProfile固有の案内へ変換し、不明な場合は安全な説明を返す。 */
export const getProfileBlockedFeedback = (
  error: unknown,
  fallbackDescription =
    "現在の状態では保存を続けられません。ページを再読み込みして、プロフィールの状態を確認してください。",
): ProfileBlockedFeedback => {
  const source =
    error && typeof error === "object"
      ? "graphQLErrors" in error
        ? error.graphQLErrors
        : "errors" in error
          ? error.errors
          : undefined
      : undefined
  const codes = Array.isArray(source) ? getGraphQLErrorCodes(source) : []
  return resolveErrorCodeFeedback<ProfileBlockedFeedback>(
    codes,
    messages,
    { title: "プロフィールを変更できません", description: fallbackDescription },
  )
}
