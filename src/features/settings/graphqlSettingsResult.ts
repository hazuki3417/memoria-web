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


/** An execution error without a typed Result is not proof of a failed write. */
export class SettingsGraphQLExecutionError extends Error {
  constructor(readonly graphQLErrors: ReadonlyArray<unknown>) {
    super("Settings GraphQL execution failed without mutation result")
    this.name = "SettingsGraphQLExecutionError"
  }
}

/**
 * With Apollo errorPolicy "all", a response may contain both GraphQL
 * errors and a typed mutation result. A present result is authoritative for
 * this operation; errors without its result still need to be classified.
 *
 * Do not infer success from unrelated partial data or an empty response.
 */
export function requireSettingsMutationOutcome<T>(
  outcome: T | null | undefined,
  response: { errors?: ReadonlyArray<unknown> },
): T {
  if (outcome !== null && outcome !== undefined) return outcome
  if (response.errors?.length) {
    throw new SettingsGraphQLExecutionError(response.errors)
  }
  throw new Error("Settings mutation outcome unavailable")
}

/** Classify only failures that are explicitly distinguishable from the public contract. */
export type SettingsSaveFailureKind = "validation" | "retryable" | "blocked" | "unknown"

export function classifySettingsSaveFailure(error: unknown): SettingsSaveFailureKind {
  if (error instanceof SettingsInputValidationError) return "validation"
  if (typeof error === "object" && error !== null) {
    if ("kind" in error) {
      if (error.kind === "blocked") return "blocked"
      if (error.kind === "retryable") return "retryable"
    }
    // API-authenticated/authorized execution failures explicitly forbid
    // continuing in this Form. Other GraphQL/transport failures are not
    // evidence that a sent write was safely rejected.
    const errors =
      "graphQLErrors" in error && Array.isArray(error.graphQLErrors)
        ? error.graphQLErrors
        : "errors" in error && Array.isArray(error.errors)
          ? error.errors
          : []
    const codes = errors.map((item) => {
      if (typeof item !== "object" || item === null || !("extensions" in item))
        return null
      const extensions = item.extensions
      if (typeof extensions !== "object" || extensions === null || !("code" in extensions))
        return null
      return typeof extensions.code === "string" ? extensions.code : null
    })
    if (codes.length > 0) {
      // Mixed or unknown errors do not prove that a mutation was rejected.
      const blocked = [
        "UNAUTHENTICATED",
        "UNAUTHORIZED", // Legacy API code during the coordinated Hybrid migration.
        "USER_REGISTRATION_REQUIRED",
        "USER_DELETING",
        "FORBIDDEN",
        "NOT_FOUND",
      ]
      if (codes.every((code) => code !== null && blocked.includes(code)))
        return "blocked"
      if (codes.every((code) => code === "VALIDATION" || code === "CONFLICT"))
        return "validation"
    }
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

/** GraphQL Request/Execution VALIDATION/CONFLICT lacks input field paths.
 * Present those as a Form error, never invent a Field validation path. */
export function resolveSettingsFailureValidation(
  error: unknown,
  fields: readonly string[],
): { fieldErrors: Record<string, string>; formError: boolean } {
  return error instanceof SettingsInputValidationError
    ? resolveSettingsValidation(error, fields)
    : { fieldErrors: {}, formError: true }
}
