import type { OperationSaveUserPreferencesMutation } from "@/infrastructure/graphql/generated"
import type { ActionOutcome } from "@/ui/Action"
import { fromGraphqlUserPreferences } from "./userPreferencesGraphqlAdapter"
import type { UserPreferences } from "./userPreferences"
import type { PreferencesSaveRejection } from "./preferencesSaveOutcome"

type MutationResult = NonNullable<OperationSaveUserPreferencesMutation["updateUserPreferences"]>

/** Preferences MutationのTyped Resultだけから操作の確実性を確定する。 */
export const classifyPersonalPreferencesMutationResult = (
  result: MutationResult,
): ActionOutcome<UserPreferences, PreferencesSaveRejection> => {
  switch (result.__typename) {
    case "UpdateUserPreferencesSuccess":
      return { kind: "success", value: fromGraphqlUserPreferences(result.preferences) }
    case "InputValidationFailure":
      return {
        kind: "rejected",
        reason: { kind: "validation", violations: result.violations },
      }
    default:
      return result satisfies never
  }
}
