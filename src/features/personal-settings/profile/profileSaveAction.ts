import type { Action, ActionOutcome } from "@/ui/Action"
import {
  SettingsGraphQLExecutionError,
  classifySettingsSaveFailure,
  getSettingsInputViolations,
  type SettingsInputViolation,
} from "@/infrastructure/graphql/settingsMutationResult"

export type ProfileSaveRejection =
  | { kind: "validation"; violations: ReadonlyArray<SettingsInputViolation> | null }
  | { kind: "blocked"; error: unknown }
  | { kind: "retryable" }

/**
 * Adapts the existing Profile save callback to the shared Action contract.
 * The legacy callback remains available to existing Story consumers.
 * An unclassified exception is not proof that a write was rejected.
 */
export function profileSaveAction(
  save: (nickname: string) => Promise<void>,
): Action<string, void, ProfileSaveRejection> {
  return async (nickname): Promise<ActionOutcome<void, ProfileSaveRejection>> => {
    try {
      await save(nickname)
      return { kind: "success", value: undefined }
    } catch (error) {
      // GraphQL execution errors without a typed mutation result do not
      // establish that the write was rejected, regardless of error codes.
      if (error instanceof SettingsGraphQLExecutionError) {
        return { kind: "unknown" }
      }
      const kind = classifySettingsSaveFailure(error)
      if (kind === "validation") {
        return {
          kind: "rejected",
          reason: { kind, violations: getSettingsInputViolations(error) },
        }
      }
      if (kind === "blocked") {
        return { kind: "rejected", reason: { kind, error } }
      }
      if (kind === "retryable") {
        // An explicit contract marker preserves existing retry feedback.
        // The queue never interprets it as permission for automatic retries.
        return { kind: "rejected", reason: { kind } }
      }
      return { kind: "unknown" }
    }
  }
}
