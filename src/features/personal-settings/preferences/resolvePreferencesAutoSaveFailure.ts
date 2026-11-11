import {
  classifySettingsSaveFailure,
  getSettingsInputViolations,
} from "@/infrastructure/graphql/settingsMutationResult"
import type { AutoSaveFailure } from "@/ui/AutoSave"
import { getPreferencesBlockedFeedback } from "./preferencesBlockedFeedback"

/** Translate GraphQL and transport errors only at the Preferences Action boundary. */
export function resolvePreferencesAutoSaveFailure(error: unknown): AutoSaveFailure {
  const kind = classifySettingsSaveFailure(error)
  switch (kind) {
    case "validation":
      return { kind, violations: getSettingsInputViolations(error) }
    case "blocked":
      return { kind, feedback: getPreferencesBlockedFeedback(error) }
    case "retryable":
      return { kind }
    case "unknown":
      return { kind }
  }
}
