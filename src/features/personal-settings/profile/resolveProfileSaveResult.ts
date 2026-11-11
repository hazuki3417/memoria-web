import { resolveSaveAction, type SaveActionFailure } from "@/ui/SaveAction"
import {
  classifySettingsSaveFailure,
  getSettingsInputViolations,
} from "@/infrastructure/graphql/settingsMutationResult"
import { getProfileBlockedFeedback } from "./profileBlockedFeedback"

/** Adapt Profile mutation success and known failure to the shared Action result. */
export function resolveProfileSaveResult(
  persist: () => Promise<string>,
  blockedMessage?: string,
) {
  return resolveSaveAction(persist, (error): SaveActionFailure => {
    switch (classifySettingsSaveFailure(error)) {
      case "validation":
        return { status: "validation", violations: getSettingsInputViolations(error) }
      case "blocked":
        return { status: "blocked", feedback: getProfileBlockedFeedback(error, blockedMessage) }
      case "retryable":
        return { status: "retryable" }
      case "unknown":
        return { status: "unknown" }
    }
  })
}
