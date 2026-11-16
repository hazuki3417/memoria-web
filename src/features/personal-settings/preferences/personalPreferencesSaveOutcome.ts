import type { Action } from "@/ui/Action"
import type { FormInputViolation } from "@/ui/formValidation"
import type { PersonalPreferencesValues, PersonalPreferencesPatch } from "./personalPreferences"

/** 保存結果の確実性を表し、表示用の失敗理由はFeatureへ渡す。 */
export type PersonalPreferencesSaveRejection =
  | { kind: "validation"; violations: ReadonlyArray<FormInputViolation> }
  | { kind: "blocked"; error: unknown }
  | { kind: "retryable" }

export type SavePersonalPreferencesAction = Action<
  PersonalPreferencesPatch,
  PersonalPreferencesValues,
  PersonalPreferencesSaveRejection
>

/** 固定されたUserに対する保存・現在値照会・明示採用の契約。 */
export type PersonalPreferencesSaveOperations = {
  save: SavePersonalPreferencesAction
  observe: () => Promise<PersonalPreferencesValues>
  confirm: (patch: PersonalPreferencesPatch) => void
  isAccentConfirmed: (color: string) => boolean
}
