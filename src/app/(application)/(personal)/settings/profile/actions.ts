"use server"

import { auth0 } from "@/lib/auth0"
import { updateMemoriaProfile } from "@/infrastructure/graphql"

export async function updateProfileAction(nickname: string): Promise<void> {
  if (!(await auth0.getSession())) throw new Error("PROFILE_BLOCKED")
  if (!nickname.trim()) throw new Error("PROFILE_VALIDATION")
  const result = await updateMemoriaProfile(nickname)
  if (result.kind === "updated") return
  if (result.kind === "unavailable") throw new Error("PROFILE_BLOCKED")
  throw new Error("PROFILE_RETRYABLE")
}
