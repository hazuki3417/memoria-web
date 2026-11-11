import type { ExplicitSaveResult } from "@/ui/ExplicitSave"
import {
  classifySettingsSaveFailure,
  getSettingsInputViolations,
} from "@/infrastructure/graphql/settingsMutationResult"
import { getProfileBlockedFeedback } from "./profileBlockedFeedback"

/** Convert a Profile update into a user-visible result at the action boundary. */
export async function resolveProfileSaveResult(
  nickname: string,
  persist: () => Promise<void>,
  blockedMessage?: string,
): Promise<ExplicitSaveResult<string>> {
  try {
    await persist()
    return { status: "confirmed", value: nickname }
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
