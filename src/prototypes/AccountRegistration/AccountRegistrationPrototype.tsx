"use client"

import {
  AccountRegistration,
  type AccountRegistrationReviewState,
} from "@/features/account-registration"
import { showNotification } from "@/components/Feedback"

/** Storybook専用Adapter。本体と同じUIを用い、登録やLogoutは実行しない。 */
export function AccountRegistrationPrototype({
  reviewState = "default",
}: {
  reviewState?: AccountRegistrationReviewState
}) {
  return (
    <AccountRegistration
      reviewState={reviewState}
      onRegister={async () => "success"}
      onRegisterSuccess={() =>
        showNotification({
          kind: "success",
          title: "アカウント登録",
          description: "登録が完了しました。",
        })
      }
      onExit={() => undefined}
    />
  )
}
