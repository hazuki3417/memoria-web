import { resolveSaveAction, type SaveActionFailure } from "@/ui/SaveAction"
import {
  classifySettingsSaveFailure,
  getSettingsInputViolations,
} from "@/infrastructure/graphql/settingsMutationResult"
import { getCommunityBlockedFeedback } from "../communityBlockedFeedback"

/** Adapt confirmed server Community name and failures to the shared Action result. */
export function resolveCommunityNameSaveResult(persist: () => Promise<string>) {
  return resolveSaveAction(persist, (error): SaveActionFailure => {
    switch (classifySettingsSaveFailure(error)) {
      case "validation":
        return { status: "validation", violations: getSettingsInputViolations(error) }
      case "blocked":
        return { status: "blocked", feedback: getCommunityBlockedFeedback(error, "Community名") }
      case "retryable":
        return { status: "retryable" }
      case "unknown":
        return { status: "unknown" }
    }
  })
}
