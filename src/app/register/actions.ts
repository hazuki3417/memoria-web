"use server"

import { auth0 } from "@/lib/auth0"
import { registerMemoriaUser } from "@/infrastructure/graphql"
import type { RegistrationResult } from "@/infrastructure/graphql"

export async function registerUserAction(nickname: string): Promise<RegistrationResult> {
  if (!(await auth0.getSession())) return { kind: "unavailable" }
  if (!nickname.trim()) return { kind: "validation" }
  return registerMemoriaUser(nickname)
}
