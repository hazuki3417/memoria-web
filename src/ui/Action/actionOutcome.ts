/** 一回の遠隔操作の成立確実性を表す。後続の同期や通知の成否は含めない。 */
export type ActionOutcome<Success, Rejection> =
  | { kind: "success"; value: Success }
  | { kind: "rejected"; reason: Rejection }
  | { kind: "unknown" }
