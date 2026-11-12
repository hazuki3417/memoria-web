/**
 * The outcome describes one operation, not follow-up refetch or UI feedback.
 * A transport failure alone is not evidence that a remote write was rejected.
 */
export type ActionOutcome<Success, Rejection> =
  | { kind: "success"; value: Success }
  | { kind: "rejected"; reason: Rejection }
  | { kind: "unknown" }

/** An action is an ordinary asynchronous function; no wrapper is required. */
export type Action<Input, Success, Rejection> = (
  input: Input,
) => Promise<ActionOutcome<Success, Rejection>>
