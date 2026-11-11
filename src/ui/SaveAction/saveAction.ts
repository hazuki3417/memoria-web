import type { FormInputViolation } from "@/ui/formValidation"

/** The result of a save is the same regardless of how it was triggered. */
export type SaveActionFailure =
  | { status: "validation"; violations: ReadonlyArray<FormInputViolation> | null }
  | { status: "retryable" }
  | { status: "blocked"; feedback: { title: string; description: string } | null }
  | { status: "unknown" }

export type SaveActionResult<T> =
  | { status: "confirmed"; value: T }
  | SaveActionFailure

/** Classifies an external operation once, at the Feature Action boundary. */
export async function resolveSaveAction<T>(
  persist: () => Promise<T>,
  classify: (error: unknown) => SaveActionFailure,
): Promise<SaveActionResult<T>> {
  try {
    return { status: "confirmed", value: await persist() }
  } catch (error) {
    return classify(error)
  }
}

/**
 * Compatibility adapter for existing autosave queues whose success path
 * expects a confirmed value and whose failure path pauses on rejection.
 * This is not a second Action contract or an alternative retry mechanism.
 */
export class SaveActionError extends Error {
  constructor(readonly failure: SaveActionFailure) {
    super("Save Action did not confirm the change")
    this.name = "SaveActionError"
  }
}

export function requireConfirmedSave<T>(result: SaveActionResult<T>): T {
  if (result.status === "confirmed") return result.value
  throw new SaveActionError(result)
}

export function getSaveActionFailure(error: unknown): SaveActionFailure {
  return error instanceof SaveActionError
    ? error.failure
    : { status: "unknown" }
}
