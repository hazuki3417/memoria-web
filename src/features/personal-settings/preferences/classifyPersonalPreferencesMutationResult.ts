import type { OperationSaveUserPreferencesMutation } from "@/infrastructure/graphql/generated"
import type { ActionOutcome } from "@/ui/Action"
import { fromGraphqlPersonalPreferences } from "./personalPreferencesGraphqlAdapter"
import type { PersonalPreferencesValues } from "./personalPreferences"
import type { PersonalPreferencesSaveRejection } from "./personalPreferencesSaveOutcome"

type MutationResult = NonNullable<OperationSaveUserPreferencesMutation["updateUserPreferences"]>

/** Preferences MutationのTyped Resultだけから操作の確実性を確定する。 */
export const classifyPersonalPreferencesMutationResult = (
  result: MutationResult,
): ActionOutcome<PersonalPreferencesValues, PersonalPreferencesSaveRejection> => {
  switch (result.__typename) {
    case "UpdateUserPreferencesSuccess":
      return { kind: "success", value: fromGraphqlPersonalPreferences(result.preferences) }
    case "InputValidationFailure":
      return {
        kind: "rejected",
        reason: { kind: "validation", violations: result.violations },
      }
    default:
      return result satisfies never
  }
}
