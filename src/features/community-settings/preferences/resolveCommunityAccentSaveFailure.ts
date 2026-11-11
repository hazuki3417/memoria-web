import {
  classifySettingsSaveFailure,
  getSettingsInputViolations,
} from "@/infrastructure/graphql/settingsMutationResult"
import type { SaveActionFailure } from "@/ui/SaveAction"
import { getCommunityBlockedFeedback } from "../communityBlockedFeedback"

/** Feature-specific GraphQL classification; Preview and scheduling stay outside Action. */
export function resolveCommunityAccentSaveFailure(error: unknown): SaveActionFailure {
  const status = classifySettingsSaveFailure(error)
  switch (status) {
    case "validation":
      return { status, violations: getSettingsInputViolations(error) }
    case "blocked":
      return { status, feedback: getCommunityBlockedFeedback(error, "Community設定") }
    case "retryable":
    case "unknown":
      return { status }
  }
}
