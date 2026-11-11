import { resolveSaveAction, type SaveActionFailure } from "@/ui/SaveAction"
import {
  classifySettingsSaveFailure,
  getSettingsInputViolations,
} from "@/infrastructure/graphql/settingsMutationResult"
import { getCommunityBlockedFeedback } from "../communityBlockedFeedback"

/** Adapt confirmed Alias and failures to the shared Action result. */
export function resolveCommunityAliasSaveResult(
  alias: string | null,
  persist: () => Promise<void>,
) {
  return resolveSaveAction(
    async () => {
      await persist()
      return alias
    },
    (error): SaveActionFailure => {
      switch (classifySettingsSaveFailure(error)) {
        case "validation":
          return { status: "validation", violations: getSettingsInputViolations(error) }
        case "blocked":
          return { status: "blocked", feedback: getCommunityBlockedFeedback(error, "Community別名") }
        case "retryable":
          return { status: "retryable" }
        case "unknown":
          return { status: "unknown" }
      }
    },
  )
}
