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
