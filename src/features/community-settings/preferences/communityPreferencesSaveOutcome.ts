import type { ActionOutcome } from "@/ui/Action"
import type { FormInputViolation } from "@/ui/formValidation"
import type { CommunityPreferencesPatch, CommunityPreferencesValues } from "./communityPreferences"

/** 遠隔保存の確実性と、明示Recoveryに必要な拒否理由を表す。 */
export type CommunityPreferencesSaveRejection =
  | { kind: "blocked"; error: unknown }
  | { kind: "validation"; violations: ReadonlyArray<FormInputViolation> | null }
  | { kind: "rejected" }

export type CommunityPreferencesSaveOutcome = ActionOutcome<
  CommunityPreferencesValues,
  CommunityPreferencesSaveRejection
>

export type SaveCommunityPreferencesAction = (
  patch: CommunityPreferencesPatch,
) => Promise<CommunityPreferencesSaveOutcome>
