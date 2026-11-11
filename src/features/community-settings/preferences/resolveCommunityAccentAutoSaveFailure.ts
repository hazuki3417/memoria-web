import {
  classifySettingsSaveFailure,
  getSettingsInputViolations,
} from "@/infrastructure/graphql/settingsMutationResult"
import type { AutoSaveFailure } from "@/ui/AutoSave"
import { getCommunityBlockedFeedback } from "../communityBlockedFeedback"

/** Convert GraphQL failure into an Accent Action error without exposing transport data. */
export function resolveCommunityAccentAutoSaveFailure(error: unknown): AutoSaveFailure {
  const kind = classifySettingsSaveFailure(error)
  switch (kind) {
    case "validation":
      return { kind, violations: getSettingsInputViolations(error) }
    case "blocked":
      return { kind, feedback: getCommunityBlockedFeedback(error, "Community設定") }
    case "retryable":
      return { kind }
    case "unknown":
      return { kind }
  }
}
