import type { FormInputViolation } from "@/ui/formValidation"

/**
 * Autosave owns a persistent queue. A failed attempt is a meaningful rejection,
 * not a signal to retry automatically; the queue preserves the pending draft.
 */
export type AutoSaveFailure =
  | { kind: "validation"; violations: ReadonlyArray<FormInputViolation> | null }
  | { kind: "retryable" }
  | { kind: "blocked"; feedback: { title: string; description: string } }
  | { kind: "unknown" }

/** Only the Action boundary creates this error; controllers never inspect GraphQL. */
export class AutoSaveActionError extends Error {
  constructor(readonly failure: AutoSaveFailure) {
    super("Autosave did not confirm the submitted change")
    this.name = "AutoSaveActionError"
  }
}

/** Unexpected errors must not be mistaken for a safely rejected write. */
export function getAutoSaveFailure(error: unknown): AutoSaveFailure {
  return error instanceof AutoSaveActionError
    ? error.failure
    : { kind: "unknown" }
}
