"use server"

import { updateMemoriaPreferences } from "@/infrastructure/graphql"
import type { UserPreferencesPatch } from "@/features/settings/userPreferences"
import { auth0 } from "@/lib/auth0"

export async function updatePreferencesAction(patch: UserPreferencesPatch) {
  if (!(await auth0.getSession())) return { kind: "blocked" as const }
  const result = await updateMemoriaPreferences(patch)
  if (result.kind === "updated") return { kind: "updated" as const, preferences: result.preferences }
  if (result.kind === "unavailable") return { kind: "blocked" as const }
  return { kind: "retryable" as const }
}
