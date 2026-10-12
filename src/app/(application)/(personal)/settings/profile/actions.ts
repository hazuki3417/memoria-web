"use server"

import { auth0 } from "@/lib/auth0"
import { updateMemoriaProfile } from "@/infrastructure/graphql"
import type { UpdateProfileResult } from "@/infrastructure/graphql"

export async function updateProfileAction(nickname: string): Promise<UpdateProfileResult> {
  if (!(await auth0.getSession())) return { kind: "unavailable" }
  if (!nickname.trim()) return { kind: "validation" }
  return updateMemoriaProfile(nickname)
}
