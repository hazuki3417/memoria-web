"use client"

import { useRouter } from "next/navigation"
import { useRegisterMemoriaUserMutation } from "@/infrastructure/graphql/generated"
import {
  AccountRegistration,
  type AccountRegistrationResult,
} from "./AccountRegistration"
import { isBlockingRegistrationError } from "./registrationError"

/** API接続・登録後Navigationを担当し、画面UIとStorybookのFixtureは所有しない。 */
export function ConnectedAccountRegistration() {
  const router = useRouter()
  const [registerMutation] = useRegisterMemoriaUserMutation()

  const register = async (
    nickname: string,
  ): Promise<AccountRegistrationResult> => {
    try {
      const result = await registerMutation({
        variables: { input: { nickname } },
      })
      if (!result.data?.registerUser.user) return "failure"

      router.replace("/dashboard")
      router.refresh()
      return "success"
    } catch (error) {
      return isBlockingRegistrationError(error) ? "blocking" : "failure"
    }
  }

  return (
    <AccountRegistration
      onRegister={register}
      onExit={() => window.location.assign("/auth/logout")}
    />
  )
}
