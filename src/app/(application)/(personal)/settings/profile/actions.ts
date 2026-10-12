"use server"

import { auth0 } from "@/lib/auth0"
import { updateMemoriaProfile } from "@/infrastructure/graphql"

export type ProfileActionResult = "updated" | "blocked" | "retryable"

export async function updateProfileAction(nickname: string): Promise<ProfileActionResult> {
  if (!(await auth0.getSession())) return "blocked"
  if (!nickname.trim()) return "retryable"
  const result = await updateMemoriaProfile(nickname)
  if (result.kind === "updated") return "updated"
  if (result.kind === "unavailable") return "blocked"
  return "retryable"
}
