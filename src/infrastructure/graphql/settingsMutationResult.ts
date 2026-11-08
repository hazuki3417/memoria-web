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

/** Expose only typed rejection data to Form presentation; never infer field paths from GraphQL errors. */
export function getSettingsInputViolations(
  error: unknown,
): ReadonlyArray<SettingsInputViolation> | null {
  return error instanceof SettingsInputValidationError ? error.violations : null
}
