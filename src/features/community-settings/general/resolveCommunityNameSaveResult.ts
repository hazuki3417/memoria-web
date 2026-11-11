import type { ExplicitSaveResult } from "@/ui/ExplicitSave"
import {
  classifySettingsSaveFailure,
  getSettingsInputViolations,
} from "@/infrastructure/graphql/settingsMutationResult"
import { getCommunityBlockedFeedback } from "../communityBlockedFeedback"

/** Convert the confirmed Community name or failure into a Form-facing result. */
export async function resolveCommunityNameSaveResult(
  persist: () => Promise<string>,
): Promise<ExplicitSaveResult<string>> {
  try {
    return { status: "confirmed", value: await persist() }
  } catch (error) {
    const kind = classifySettingsSaveFailure(error)
    switch (kind) {
      case "validation":
        return { status: "validation", violations: getSettingsInputViolations(error) }
      case "blocked":
        return { status: "blocked", feedback: getCommunityBlockedFeedback(error, "Community名") }
      case "retryable":
        return { status: "retryable" }
      case "unknown":
        return { status: "unknown" }
    }
  }
}
