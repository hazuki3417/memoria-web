import type { Action, ActionOutcome } from "./actionOutcome"

/**
 * Builds an Action from an operation-specific transport and evidence mapper.
 * The shared adapter knows nothing about GraphQL, domains or UI.
 */
export function createActionAdapter<Input, Response, Success, Rejection>({
  execute,
  classify,
  classifyError,
  afterSuccess,
}: {
  execute: (input: Input) => Promise<Response>
  classify: (response: Response) => ActionOutcome<Success, Rejection>
  /** Only return a rejection here when the error proves non-execution. */
  classifyError?: (error: unknown) => ActionOutcome<Success, Rejection>
  /** Post-action sync is not part of the confirmed mutation outcome. */
  afterSuccess?: (success: Success, input: Input) => void | Promise<void>
}): Action<Input, Success, Rejection> {
  return async (input) => {
    let result: Response
    try {
      result = await execute(input)
    } catch (error) {
      if (!classifyError) return { kind: "unknown" }
      try {
        return classifyError(error)
      } catch {
        return { kind: "unknown" }
      }
    }

    let outcome: ActionOutcome<Success, Rejection>
    try {
      outcome = classify(result)
    } catch {
      return { kind: "unknown" }
    }

    if (outcome.kind === "success" && afterSuccess) {
      // A confirmed operation must not be rolled back by follow-up sync.
      try {
        void Promise.resolve(afterSuccess(outcome.value, input)).catch(() => undefined)
      } catch {
        // Refresh/notification is not part of the operation evidence.
      }
    }
    return outcome
  }
}
