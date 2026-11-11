import type { SaveActionResult } from "@/ui/SaveAction"
import {
  classifySettingsSaveFailure,
  getSettingsInputViolations,
} from "@/infrastructure/graphql/settingsMutationResult"
import { getProfileBlockedFeedback } from "./profileBlockedFeedback"

/** Convert a Profile update into a user-visible result at the action boundary. */
export async function resolveProfileSaveResult(
  persist: () => Promise<string>,
  blockedMessage?: string,
): Promise<SaveActionResult<string>> {
  try {
    return { status: "confirmed", value: await persist() }
  } catch (error) {
    const kind = classifySettingsSaveFailure(error)
    switch (kind) {
      case "validation":
        return { status: "validation", violations: getSettingsInputViolations(error) }
      case "blocked":
        return { status: "blocked", feedback: getProfileBlockedFeedback(error, blockedMessage) }
      case "retryable":
        return { status: "retryable" }
      case "unknown":
        return { status: "unknown" }
    }
  }
}
