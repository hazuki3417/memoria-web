import type { Action } from "@/ui/Action"
import type { FormInputViolation } from "@/ui/formValidation"

/** Profile保存の成立結果と、未成立が確認できた理由を表す契約。 */
export type ProfileSaveRejection =
  | { kind: "validation"; violations: ReadonlyArray<FormInputViolation> }
  | { kind: "blocked"; error: unknown }
  | { kind: "retryable" }

export type SaveProfile = Action<string, string, ProfileSaveRejection>
