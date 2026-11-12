import type { Action } from "@/ui/Action"
import type { SettingsInputViolation } from "@/infrastructure/graphql/settingsMutationResult"

/** The rejection is confirmed by the operation contract, not by transport. */
export type ProfileSaveRejection =
  | { kind: "validation"; violations: ReadonlyArray<SettingsInputViolation> }
  | { kind: "blocked"; error: unknown }
  | { kind: "retryable" }

export type SaveProfile = Action<string, void, ProfileSaveRejection>
