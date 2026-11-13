import type { Action } from "@/ui/Action"
import type { FormInputViolation } from "@/ui/formValidation"

/** Aliasのnull解除を含め、Mutationで確定した値と拒否理由を保持する。 */
export type CommunityAliasSaveRejection =
  | { kind: "validation"; violations: ReadonlyArray<FormInputViolation> }
  | { kind: "blocked"; error: unknown }
  | { kind: "retryable" }

export type SaveCommunityAlias = Action<string | null, string | null, CommunityAliasSaveRejection>
