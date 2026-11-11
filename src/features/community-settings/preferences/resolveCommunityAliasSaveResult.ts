import type { SaveActionResult } from "@/ui/SaveAction"
import {
  classifySettingsSaveFailure,
  getSettingsInputViolations,
} from "@/infrastructure/graphql/settingsMutationResult"
import { getCommunityBlockedFeedback } from "../communityBlockedFeedback"

/** Convert a Community Alias update into a Form-facing result. */
export async function resolveCommunityAliasSaveResult(
  alias: string | null,
  persist: () => Promise<void>,
): Promise<SaveActionResult<string | null>> {
  try {
    await persist()
    return { status: "confirmed", value: alias }
  } catch (error) {
    const kind = classifySettingsSaveFailure(error)
    switch (kind) {
      case "validation":
        return { status: "validation", violations: getSettingsInputViolations(error) }
      case "blocked":
        return { status: "blocked", feedback: getCommunityBlockedFeedback(error, "Community別名") }
      case "retryable":
        return { status: "retryable" }
      case "unknown":
        return { status: "unknown" }
    }
  }
}
