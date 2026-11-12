import type { Action } from "@/ui/Action"
import type { FormInputViolation } from "@/ui/formValidation"

/** The rejection is confirmed by the operation contract, not by transport. */
export type ProfileSaveRejection =
  | { kind: "validation"; violations: ReadonlyArray<FormInputViolation> }
  | { kind: "blocked"; error: unknown }
  | { kind: "retryable" }

export type SaveProfile = Action<string, void, ProfileSaveRejection>
