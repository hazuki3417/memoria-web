/** Expected domain failure from a successfully executed GraphQL mutation. */
export type SettingsInputViolation = {
  scope: string
  code: string
  inputPaths: ReadonlyArray<{ segments: ReadonlyArray<string> }>
}

export class SettingsInputValidationError extends Error {
  readonly kind = "validation" as const
  // Existing Settings save queues distinguish a rejected result from transport
  // uncertainty using this legacy marker until all operations use one classifier.
  readonly graphQLErrors: readonly [] = []
  constructor(readonly violations: ReadonlyArray<SettingsInputViolation>) {
    super("Settings input validation rejected")
    this.name = "SettingsInputValidationError"
  }
}


/** Classify only failures that are explicitly distinguishable from the public contract. */
export type SettingsSaveFailureKind = "validation" | "retryable" | "blocked" | "unknown"

export function classifySettingsSaveFailure(error: unknown): SettingsSaveFailureKind {
  if (error instanceof SettingsInputValidationError) return "validation"
  if (typeof error === "object" && error !== null && "kind" in error) {
    if (error.kind === "blocked") return "blocked"
    if (error.kind === "retryable") return "retryable"
  }
  // A missing response, timeout or transport failure may already have committed.
  return "unknown"
}

const validationMessages: Record<string, string> = {
  REQUIRED: "必須項目です。",
  INVALID_FORMAT: "入力形式を確認してください。",
  INVALID_VALUE: "入力内容を確認してください。",
  TOO_LONG: "文字数が上限を超えています。",
  OUT_OF_RANGE: "指定された範囲内で入力してください。",
  INVALID_COMBINATION: "入力内容の組み合わせを確認してください。",
}

/**
 * The API's paths are relative to the mutation input, not GraphQL errors[].path.
 * Do not expose raw server messages/codes or guess unknown paths as field errors.
 */
export function resolveSettingsValidation(
  error: SettingsInputValidationError,
  fieldNames: readonly string[],
): { fieldErrors: Record<string, string>; formError: boolean } {
  const fieldErrors: Record<string, string> = {}
  let formError = false
  for (const violation of error.violations) {
    const field =
      violation.scope === "FIELD" &&
      violation.inputPaths.length === 1 &&
      violation.inputPaths[0]?.segments.length === 1
        ? violation.inputPaths[0]?.segments[0]
        : undefined
    if (field && fieldNames.includes(field)) {
      fieldErrors[field] = validationMessages[violation.code] ?? "入力内容を確認してください。"
    } else {
      formError = true
    }
  }
  if (error.violations.length === 0) formError = true
  return { fieldErrors, formError }
}
