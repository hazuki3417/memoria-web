import type { Action } from "@/ui/Action"
import type { FormInputViolation } from "@/ui/formValidation"

/** Community名保存の確定結果と、拒否が確認できた理由を表す。 */
export type CommunityNameSaveRejection =
  | { kind: "validation"; violations: ReadonlyArray<FormInputViolation> }
  | { kind: "blocked"; error: unknown }
  | { kind: "retryable" }

export type SaveCommunityName = Action<string, string, CommunityNameSaveRejection>
