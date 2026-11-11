import {
  classifySettingsSaveFailure,
  getSettingsInputViolations,
} from "@/infrastructure/graphql/settingsMutationResult"
import type { SaveActionFailure } from "@/ui/SaveAction"
import { getPreferencesBlockedFeedback } from "./preferencesBlockedFeedback"

/** Feature-specific GraphQL classification; no Queue or Trigger knowledge. */
export function resolvePreferencesSaveFailure(error: unknown): SaveActionFailure {
  const status = classifySettingsSaveFailure(error)
  switch (status) {
    case "validation":
      return { status, violations: getSettingsInputViolations(error) }
    case "blocked":
      return { status, feedback: getPreferencesBlockedFeedback(error) }
    case "retryable":
    case "unknown":
      return { status }
  }
}
