import type { Action } from "@/ui/Action"
import type { FormInputViolation } from "@/ui/formValidation"
import type { UserPreferences, UserPreferencesPatch } from "./userPreferences"

/** 保存結果の確実性を表し、表示用の失敗理由はFeatureへ渡す。 */
export type PersonalPreferencesSaveRejection =
  | { kind: "validation"; violations: ReadonlyArray<FormInputViolation> }
  | { kind: "blocked"; error: unknown }
  | { kind: "retryable" }

export type SavePersonalPreferencesAction = Action<
  UserPreferencesPatch,
  UserPreferences,
  PersonalPreferencesSaveRejection
>
