import type { ActionOutcome } from "./actionOutcome"

/** 入力に対して一回の操作を実行し、成立の確実性をOutcomeで返す契約。 */
export type Action<Input, Success, Rejection> = (
  input: Input,
) => Promise<ActionOutcome<Success, Rejection>>
