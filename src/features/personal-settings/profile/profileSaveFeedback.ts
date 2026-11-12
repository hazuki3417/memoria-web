import { getGraphQLErrorCodes } from "@/infrastructure/graphql/getGraphQLErrorCodes"
import { resolveErrorCodeFeedback } from "@/ui/error-feedback"
import {
  resolveSaveFeedback,
  type SaveFeedback,
  type SaveFeedbackMessages,
  type SaveFeedbackType,
} from "@/ui/save-feedback"
import type { useProfileForm } from "./useProfileForm"

type ProfileForm = ReturnType<typeof useProfileForm>
type ProfileFeedbackInput = Pick<ProfileForm, "status" | "formInvalid"> & {
  blockedMessage: string
}

const messages = {
  validation: {
    title: "入力内容を確認してください",
    description: "入力内容を確認してください。",
  },
  retryable: {
    title: "プロフィールを保存できませんでした",
    description: "入力内容は保持しています。「再試行」を選んでください。",
  },
  unknown: {
    title: "プロフィールの保存結果を確認できませんでした",
    description: "保存結果は未確定です。自動で再送しません。現在の状態を確認してください。値が一致しても、保存が成功した証明ではありません。確認できない場合は入力を控えて再読み込みしてください。",
  },
  blocked: {
    title: "プロフィールを変更できません",
    description: "ページを再読み込みして状態を確認してください。",
  },
} satisfies SaveFeedbackMessages

const blockedMessages = {
  UNAUTHENTICATED: {
    title: "ログインが必要です",
    description: "再度ログインしてから確認してください。",
  },
  USER_REGISTRATION_REQUIRED: {
    title: "アカウント登録が必要です",
    description: "アカウント登録を完了してください。",
  },
  USER_DELETING: {
    title: "アカウントの削除処理中です",
    description: "保存を繰り返さず、アカウントの状態を確認してください。",
  },
  FORBIDDEN: {
    title: "プロフィールを変更できません",
    description: "アカウントの権限を確認してください。",
  },
  NOT_FOUND: {
    title: "プロフィールを確認できません",
    description: "ページを再読み込みして状態を確認してください。",
  },
} satisfies Record<string, { title: string; description: string }>

/** Blockedの原因を公開GraphQL Codeに対応する安全な案内へ解決する。 */
const resolveBlockedMessage = (
  error: unknown,
  fallback: { title: string; description: string },
) => {
  const source =
    error && typeof error === "object"
      ? "graphQLErrors" in error
        ? error.graphQLErrors
        : "errors" in error
          ? error.errors
          : undefined
      : undefined
  const codes = Array.isArray(source) ? getGraphQLErrorCodes(source) : []
  return resolveErrorCodeFeedback(codes, blockedMessages, fallback)
}

/** 保存状態から一件のFeedbackを解決し、Blockedの原因のみFeature固有の文言へ反映する。 */
export const getProfileSaveFeedback = ({
  status,
  formInvalid,
  blockedMessage,
}: ProfileFeedbackInput): SaveFeedback | null => {
  // 保存不可・結果不明の復旧を入力エラーより優先し、同時に複数表示しない。
  const type: SaveFeedbackType | null =
    status.kind === "blocked" ? "blocked"
    : status.kind === "unknown" ? "unknown"
    : formInvalid ? "validation"
    : status.kind === "retryable-error" ? "retryable"
    : null

  const feedback = resolveSaveFeedback(type, messages)
  if (feedback?.type !== "blocked" || status.kind !== "blocked") return feedback

  return {
    ...feedback,
    ...resolveBlockedMessage(status.error, {
      ...messages.blocked,
      description: blockedMessage || messages.blocked.description,
    }),
  }
}
