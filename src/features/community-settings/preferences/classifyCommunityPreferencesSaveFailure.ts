import {
  classifySettingsSaveFailure,
  getSettingsInputViolations,
} from "@/infrastructure/graphql/settingsMutationResult"
import type { CommunityPreferencesSaveOutcome } from "./communityPreferencesSaveOutcome"

/** GraphQL・通信の失敗をPreferencesの保存結果へ変換する。 */
export const classifyCommunityPreferencesSaveFailure = (
  error: unknown,
): CommunityPreferencesSaveOutcome => {
  const kind = classifySettingsSaveFailure(error)
  if (kind === "unknown") return { kind: "unknown" }
  if (kind === "blocked") return { kind: "rejected", reason: { kind, error } }
  if (kind === "validation")
    return { kind: "rejected", reason: { kind, violations: getSettingsInputViolations(error) } }
  return { kind: "rejected", reason: { kind: "rejected" } }
}
